//prettier-ignore
const { range, mergeDeepLeft, has, pick, last, propEq, defaultTo, pipe, prop, isNil, always, map } = require('ramda')

const Store = require('../base')
const async = require('async')
const stream = require('stream')
const { MongoClient, ObjectId: ObjectID } = require('mongodb')
const { Result, Option } = require('@avanzu/std')
const semver = require('semver')
const { filterEmpty, noopAsync, isNothing } = require('../util')
const { version } = require('mongodb/package.json')
const StoreError = require('../error')

const debug = require('debug')('@avanzu/eventstore/database/mongodb')
const major = semver.major(version)

const inspect = (message) => (data) => (debug(message, data), data)
const notice = (message) => (data) => (debug(message), data)

const isTransactionOk = (revMax, lastEvt) =>
    (revMax === -1 && !lastEvt.restInCommitStream) ||
    (revMax !== -1 && (lastEvt.streamRevision === revMax - 1 || !lastEvt.restInCommitStream))

const withConstraints = pipe(defaultTo({}), pick(['aggregate', 'context', 'aggregateId']))

const requireAggregateId = (obj) =>
    Result.fromPredicate(has('aggregateId'), obj).mapErr(() =>
        StoreError.new('Missing required property "aggregateId".', obj)
    )

const requireCommitId = (obj) =>
    Result.fromPredicate(has('commitId'), obj).mapErr(() =>
        StoreError.new('Missing required property "commitId".', obj)
    )

const compareCommitId = (expected) => (obj) =>
    Result.fromPredicate(propEq('commitId', expected), obj).mapErr(() =>
        StoreError.new(`Mismatching commitId. Expected "${expected}".`, obj)
    )

const eventSort = [
    ['commitStamp', 'asc'],
    ['streamRevision', 'asc'],
    ['commitSequence', 'asc'],
]

const snapSort = [
    ['revision', 'desc'],
    ['version', 'desc'],
    ['commitStamp', 'desc'],
]

const streamEventsByRevision = (self, findStatement, revMin, revMax, resultStream, lastEvent) => {
    findStatement.streamRevision = revMax === -1 ? { $gte: revMin } : { $gte: revMin, $lt: revMax }

    var mongoStream = self.events.find(findStatement, {
        sort: [
            ['commitStamp', 'asc'],
            ['streamRevision', 'asc'],
            ['commitSequence', 'asc'],
        ],
    })

    async.during(
        (clb) => {
            mongoStream.hasNext(clb)
        },
        (clb) => {
            mongoStream.next((error, e) => {
                if (error) return clb(error)

                if (!lastEvent) {
                    lastEvent = e
                    return resultStream.write(lastEvent, clb) // Should write the event to resultStream as if there's no lastEvent when there's an event in stream, the event must be first entry of this query.
                }

                // if for some reason we have written this event alredy
                if (
                    (e.streamRevision === lastEvent.streamRevision &&
                        e.restInCommitStream <= lastEvent.restInCommitStream) ||
                    e.streamRevision <= lastEvent.streamRevision
                ) {
                    return clb()
                }

                lastEvent = e
                resultStream.write(lastEvent, clb)
            })
        },
        (error) => {
            if (error) {
                return resultStream.destroy(error)
            }

            if (!lastEvent) {
                return resultStream.end()
            }
            /* 
            var txOk =
                (revMax === -1 && !lastEvent.restInCommitStream) ||
                (revMax !== -1 &&
                    (lastEvent.streamRevision === revMax - 1 || !lastEvent.restInCommitStream))
            */

            if (isTransactionOk(revMax, lastEvent)) {
                // the following is usually unnecessary
                self.removeTransactions(lastEvent)
                resultStream.end() // lastEvent was keep duplicated from this line. We should not re-write last event into the stream when ending it. thus end() rather then end(lastEvent).
            }

            self.repairFailedTransaction(lastEvent)
                .then(() =>
                    streamEventsByRevision(
                        self,
                        findStatement,
                        lastEvent.revMin,
                        revMax,
                        resultStream,
                        lastEvent
                    )
                )
                .catch((err) => {
                    if (err.message.indexOf('missing tx entry') >= 0) {
                        return resultStream.end(lastEvent) // Maybe we should check on this line too?
                    }
                    debug(err)
                    return resultStream.destroy(error)
                })
        }
    )
}

class Mongo extends Store {
    constructor(options) {
        super(options)
        var defaults = {
            host: 'localhost',
            port: 27017,
            dbName: 'eventstore',
            eventsCollectionName: 'events',
            snapshotsCollectionName: 'snapshots',
            transactionsCollectionName: 'transactions',
            options: { tls: false },
        }

        this.options = mergeDeepLeft(options, defaults)
    }

    connectionUrl() {
        var options = this.options

        var connectionUrl

        if (options.url) {
            connectionUrl = options.url
        } else {
            var members = options.servers
                ? options.servers
                : [{ host: options.host, port: options.port }]

            var memberString = members.map(({ host, port }) => `${host}:${port}`)
            var authString =
                options.username && options.password
                    ? options.username + ':' + options.password + '@'
                    : ''
            var optionsString = options.authSource ? '?authSource=' + options.authSource : ''

            connectionUrl =
                'mongodb://' + authString + memberString + '/' + options.dbName + optionsString
        }

        return connectionUrl
    }

    connectV2(connectionUrl, options) {
        debug('connectV2 using %s and %o', connectionUrl, options)
        this.client = new MongoClient()

        return this.client
            .connect(connectionUrl, options)
            .then((db) => (this.db = db))
            .then(() => this.db.on('close', () => this.close()))
            .then(() => this.initDb())
            .then(() => this.finish('ensureIndex'))
    }

    connectV3(connectionUrl, options) {
        debug('connectV3 using %s and %o', connectionUrl, options)
        this.client = new MongoClient(connectionUrl, {
            ...options,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })

        return this.client
            .connect()
            .then((client) => (this.db = client.db()))
            .then(() => this.client.on('close', () => this.close()))
            .then(() => this.initDb())
            .then(() => this.finish('createIndex'))
    }

    connectV4(connectionUrl, options) {
        debug('connectV4 using %s and %o', connectionUrl, options)

        this.client = new MongoClient(connectionUrl, {
            ...options,
            appName: 'node-eventstore',
            directConnection: true,
        })
        return this.client
            .connect()
            .then(() => (this.db = this.client.db()))
            .then(() => this.client.on('close', () => this.close()))
            .then(() => this.initDb())
            .then(() => this.finish('createIndex'))
    }

    connect() {
        return new Promise((Ok, Err) => {
            const { options } = this.options
            const connectionUrl = this.connectionUrl()
            const method = `connectV${major}`

            debug('Opening connection to mongodb version %s V%s using %s', version, major, method)

            Result.fromNullable(this[method], `Unsupported version ${major}.`)
                .map((fn) => fn.call(this, connectionUrl, options))
                .fold(Err, Ok)
        })
    }

    static isStreamable() {
        return semver.satisfies(version, '<4.0.0')
    }

    static isDeletable() {
        return true
    }

    findEvents(query, sort = eventSort) {
        return this.events.find(query, { sort })
    }
    findEvent(query, sort = eventSort) {
        return this.events.findOne(query, { sort })
    }
    findSnapshots(query, sort = snapSort) {
        return this.snapshots.find(query, { sort })
    }
    findSnapshot(query, sort = snapSort) {
        return this.snapshots.findOne(query, { sort })
    }

    finish(ensureIndex) {
        const calls = [
            () => this.events[ensureIndex]({ aggregateId: 1, streamRevision: 1 }),
            () => this.events[ensureIndex]({ commitStamp: 1 }),
            () => this.events[ensureIndex]({ dispatched: 1 }, { sparse: true }),
            () =>
                this.events[ensureIndex]({
                    commitStamp: 1,
                    streamRevision: 1,
                    commitSequence: 1,
                }),
            () =>
                this.events[ensureIndex]({
                    aggregate: 1,
                    aggregateId: 1,
                    commitStamp: -1,
                    streamRevision: -1,
                    commitSequence: -1,
                }),
            () => this.snapshots[ensureIndex]({ aggregateId: 1, revision: -1 }),
            () =>
                this.transactions[ensureIndex]({
                    aggregateId: 1,
                    'events.streamRevision': 1,
                }),
        ]

        return calls
            .reduce((p, fn) => p.then(fn).catch(console.error), Promise.resolve())
            .then(inspect('indexes %o'))
            .then(() => this.emit('connect'))
            .then(() => this.options.heartbeat && this.startHeartbeat())
            .then(always(this))
    }

    initDb() {
        const options = this.options
        debug('acquiring collections and building indexes')
        this.events = this.db.collection(options.eventsCollectionName)
        this.snapshots = this.db.collection(options.snapshotsCollectionName)
        this.transactions = this.db.collection(options.transactionsCollectionName)

        if (options.positionsCollectionName) {
            this.positions = this.db.collection(options.positionsCollectionName)
            this.positionsCounterId = options.eventsCollectionName
        }
    }

    close() {
        this.emit('disconnect')
        this.stopHeartbeat()
        return this
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
            delete this.heartbeatInterval
        }
    }

    startHeartbeat() {
        var gracePeriod = Math.round(this.options.heartbeat / 2)
        this.heartbeatInterval = setInterval(() => {
            var graceTimer = setTimeout(() => {
                if (this.heartbeatInterval) {
                    console.error(
                        new Error('Heartbeat timeouted after ' + gracePeriod + 'ms (mongodb)').stack
                    )
                    this.disconnect()
                }
            }, gracePeriod)

            this.db.command({ ping: 1 }, (err) => {
                if (graceTimer) clearTimeout(graceTimer)
                if (err) {
                    console.error(err.stack || err)
                    this.disconnect()
                }
            })
        }, this.options.heartbeat)
    }

    disconnect() {
        return new Promise((Ok, Err) => {
            debug('closing connection')
            this.stopHeartbeat()

            if (!this.client) {
                this.close()
                Ok(this)
                return
            }

            this.client
                .close()
                .then(() => this.close())
                .then(Ok, Err)
        })
    }

    clear() {
        const clearPositions = () =>
            this.positions ? this.positions.deleteMany({}) : Promise.resolve()
        const clearEvents = () => this.events.deleteMany({})
        const clearSnapshots = () => this.snapshots.deleteMany({})
        const clearTransactions = () => this.transactions.deleteMany({})

        return new Promise((Ok, Err) => {
            Promise.all([clearEvents(), clearSnapshots(), clearTransactions(), clearPositions()])
                .then(() => Ok(this))
                .catch((err) => (debug(err), Err(err)))
        })
    }

    getNewId() {
        return Promise.resolve(new ObjectID().toString())
    }

    getNextPositions(positions) {
        const buildRange = (coll) =>
            coll
                .findOneAndUpdate(
                    { _id: this.positionsCounterId },
                    { $inc: { position: positions } },
                    { returnDocument: 'after', upsert: true }
                )
                .then(({ value }) => (value.position += 1))
                .then((pos) => range(pos - positions, pos))

        return new Promise((Ok, Err) => {
            Option.fromNullable(this.positions).fold(noopAsync, buildRange).then(Ok, Err)
        })
    }

    addEvents(events) {
        const adddOneEvent = ([event]) => this.events.insertOne(event)

        const addSomeEvents = (commitId) => (events) =>
            Promise.resolve({ _id: commitId, events, ...withConstraints(events[0]) })
                .then(inspect('Inserting transaction %o'))
                .then((tx) => this.transactions.insertOne(tx))
                .then(notice('Inserting events'))
                .then(() => this.events.insertMany(events))
                .then(notice('removing transation'))
                .then(() => this.removeTransactions(events[events.length - 1]))
                .then(notice('Resolving'))

        return new Promise((Ok, Err) => {
            if (events.length === 0) {
                return Ok(this)
            }

            const commitId = events[0].commitId

            events.forEach((evt) =>
                requireAggregateId(evt)
                    .chain(requireCommitId)
                    .chain(compareCommitId(commitId))
                    .tap((evt) => Object.assign(evt, { _id: evt.id, dispatched: false }))
                    .unwrap()
            )

            Result.fromPredicate(propEq('length', 1), events)
                .fold(addSomeEvents(commitId), adddOneEvent)
                .then(always(this))
                .then(Ok, Err)
        })
    }

    // streaming API
    streamEvents(query, skip, limit) {
        const findStatement = withConstraints(query)
        const cursor = this.findEvents(findStatement)

        if (skip) cursor.skip(skip)
        if (limit && limit > 0) cursor.limit(limit)

        return cursor
    }

    streamEventsSince(date, skip, limit) {
        const findStatement = { commitStamp: { $gte: date } }

        const cursor = this.findEvents(findStatement)

        if (skip) cursor.skip(skip)

        if (limit && limit > 0) cursor.limit(limit)

        return cursor
    }

    streamEventsByRevision(query, revMin, revMax) {
        const findStatement = requireAggregateId(query).map(withConstraints).unwrap()
        const resultStream = new stream.PassThrough({ objectMode: true, highWaterMark: 1 })
        streamEventsByRevision(this, findStatement, revMin, revMax, resultStream)
        return resultStream
    }

    getEvents(query, skip, limit) {
        return this.streamEvents(query, skip, limit).toArray()
    }

    getEventsSince(date, skip, limit) {
        return this.streamEventsSince(date, skip, limit).toArray()
    }

    getEventsByRevision(query, revMin, revMax) {
        const removeAndResolve = (lastEvt, res) =>
            this.removeTransactions(lastEvt).then(always(res))

        const repairAndRetry = (lastEvt) =>
            this.repairFailedTransaction(lastEvt).then(() =>
                this.getEventsByRevision(query, revMin, revMax)
            )

        const evaluatTransaction = (events) => {
            const lastEvent = last(events)
            return isTransactionOk(revMax, lastEvent)
                ? removeAndResolve(lastEvent, events)
                : repairAndRetry(lastEvent)
        }

        const processEvents = (events) =>
            Result.fromPredicate(isNothing, events).fold(evaluatTransaction, always([]))

        return new Promise((Ok, Err) => {
            debug('getEventsByRevision(%s, %s, %s)', query, revMin, revMax)

            const streamRevision = revMax === -1 ? { $gte: revMin } : { $gte: revMin, $lt: revMax }

            const findStatement = requireAggregateId(query)
                .map(withConstraints)
                .map((constraints) => ({ ...constraints, streamRevision }))
                .unwrap()

            this.findEvents(findStatement).toArray().then(processEvents).then(Ok, Err)
        })
    }

    getUndispatchedEvents(query) {
        return new Promise((Ok, Err) => {
            const findStatement = { dispatched: false, ...withConstraints(query) }

            this.findEvents(findStatement).toArray().then(Ok, Err)
        })
    }

    setEventToDispatched(id) {
        return this.events
            .updateOne({ _id: id }, { $unset: { dispatched: null } })
            .then(always(this))
    }

    addSnapshot(snap) {
        return new Promise((Ok, Err) => {
            debug('Adding snapshot %o', snap)

            requireAggregateId(snap)
                .map(({ id, ...snap }) => ({ _id: id, id, ...snap }))
                .promise()
                .then((snap) => this.snapshots.insertOne(snap))
                .then(always(this))
                .then(Ok, Err)
        })
    }

    cleanSnapshots(query) {
        return new Promise((Ok, Err) => {
            const findStatement = requireAggregateId(query).map(withConstraints).unwrap()

            const remove = (elements) =>
                Promise.all(elements.map(({ _id }) => this.snapshots.deleteOne({ _id })))

            const countRemaining = () =>
                semver.satisfies(version, '<3.0.0')
                    ? this.snapshots.count(findStatement)
                    : this.snapshots.countDocuments(findStatement)

            this.findSnapshots(findStatement)
                .skip(this.options.maxSnapshotsCount | 0)
                .toArray()
                .then(remove)
                .then(countRemaining)
                .then(Ok, Err)
        })
    }

    getSnapshot(query, revMax) {
        return new Promise((Ok, Err) => {
            const revision = revMax > -1 ? { $lte: revMax } : null

            const findStatement = requireAggregateId(query)
                .map(withConstraints)
                .map((query) => ({ ...query, revision }))
                .map(filterEmpty)
                .unwrap()

            this.findSnapshot(findStatement).then(Ok, Err)
        })
    }

    removeTransactions(evt) {
        return new Promise((Ok, Err) => {
            const findStatement = requireAggregateId(evt).map(withConstraints).unwrap()

            // the following is usually unnecessary
            this.transactions
                .deleteMany(findStatement)
                .then(() => this)
                .then(Ok, Err)
        })
    }

    getPendingTransactions() {
        const eventAbsent = ({ event }) => isNil(event)
        const eventPresent = ({ event }) => !isNil(event)
        const takeFulfilledValues = (results) =>
            results.filter(propEq('status', 'fulfilled')).map(prop('value'))

        const findEvent = ({ _id, aggregateId, aggregate, context }) =>
            Promise.resolve({ commitId: _id, aggregateId, aggregate, context })
                .then(filterEmpty)
                .then(inspect('Searching for event with %o'))
                .then((query) => this.events.findOne(query))
                .then((event) => ({ event, transaction: _id }))

        const findEvents = (transactions) =>
            Promise.allSettled(transactions.map(findEvent))
                .then(inspect('events of transactions %o'))
                .then(takeFulfilledValues)

        const removeTransaction = ({ transaction }) =>
            this.transactions.deleteOne({ _id: transaction })

        const removeTransactionsWithoutEvent = (xs) =>
            Promise.all(xs.filter(eventAbsent).map(removeTransaction))

        const removeEmptyTransactions = (xs) =>
            removeTransactionsWithoutEvent(xs).then(() => xs.filter(eventPresent))

        return new Promise((Ok, Err) => {
            this.transactions
                .find({})
                .toArray()
                .then(findEvents)
                .then(removeEmptyTransactions)
                .then(map(prop('event')))
                .then(inspect('pending events %o'))
                .then(Ok, Err)
        })
    }

    getLastEvent(query) {
        return new Promise((Ok, Err) => {
            const findStatement = requireAggregateId(query).map(withConstraints).unwrap()

            this.findEvent(findStatement, [
                ['commitStamp', 'desc'],
                ['streamRevision', 'desc'],
                ['commitSequence', 'desc'],
            ]).then(Ok, Err)
        })
    }

    repairFailedTransaction(lastEvt) {
        return new Promise((Ok, Err) => {
            debug('repairFailedTransaction with %o', lastEvt)

            const eventsFromTransaction = (tx) =>
                Result.fromNullable(tx, `missing tx entry for aggregate ${lastEvt.aggregateId}`)
                    .map(({ events }) => events.slice(events.length - lastEvt.restInCommitStream))
                    .unwrap()

            const insertMissing = (missingEvts) => this.events.insertMany(missingEvts)
            const removeTransaction = () => this.removeTransactions(lastEvt)

            this.transactions
                .findOne({ _id: lastEvt.commitId })
                .then(eventsFromTransaction)
                .then(insertMissing)
                .then(removeTransaction)
                .then(always(this))
                .then(Ok, Err)
        })
    }

    deleteStream(aggregateId) {
        const deleteEvents = () => this.events.deleteMany({ aggregateId })
        const deleteSnapshots = () => this.snapshots.deleteMany({ aggregateId })
        const deleteTransactions = () => this.transactions.deleteMany({ aggregateId })
        const loadEvents = () => this.getEvents({ aggregateId })

        const deleteEntries = (events) =>
            Promise.allSettled([deleteEvents(), deleteTransactions(), deleteSnapshots()]).then(
                (results) => [events].concat(results)
            )

        return new Promise((Ok, Err) => {
            loadEvents()
                .then(deleteEntries)
                .then(([events]) => Ok(events), Err)
        })
    }
}

module.exports = Mongo
