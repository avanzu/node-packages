var Store = require('../base'),
    _ = require('lodash'),
    async = require('async'),
    stream = require('stream'),
    mongo = require('mongodb'),
    ObjectID = mongo.ObjectID,
    debug = require('debug')('@avanzu/eventstore/database/mongodb')

const inspect = (message) => (data) => (debug(message, data), data)
const notice = (message) => (data) => (debug(message), data)
const filterEmpty = (obj) =>
    Object.fromEntries(Object.entries(obj).filter(([, value]) => Boolean(value)))

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

            var txOk =
                (revMax === -1 && !lastEvent.restInCommitStream) ||
                (revMax !== -1 &&
                    (lastEvent.streamRevision === revMax - 1 || !lastEvent.restInCommitStream))

            if (txOk) {
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
            options: {},
        }

        _.defaults(options, defaults)

        var defaultOpt = {
            ssl: false,
            autoReconnect: false,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }

        _.defaults(options.options, defaultOpt)

        this.options = options
    }

    connect() {
        return new Promise((Ok, Err) => {
            debug('Opening connection')
            var options = this.options

            var connectionUrl

            if (options.url) {
                connectionUrl = options.url
            } else {
                var members = options.servers
                    ? options.servers
                    : [{ host: options.host, port: options.port }]

                var memberString = _(members).map((m) => {
                    return m.host + ':' + m.port
                })
                var authString =
                    options.username && options.password
                        ? options.username + ':' + options.password + '@'
                        : ''
                var optionsString = options.authSource ? '?authSource=' + options.authSource : ''

                connectionUrl =
                    'mongodb://' + authString + memberString + '/' + options.dbName + optionsString
            }

            var client
            var ensureIndex = 'ensureIndex'

            if (mongo.MongoClient.length === 2) {
                debug('mongoClient.length === 2')
                ensureIndex = 'createIndex'
                new mongo.MongoClient(connectionUrl, options.options)
                    .connect()
                    .then((cl) => {
                        this.db = cl.db(cl.s.options.dbName)
                        if (!this.db.close) {
                            this.db.close = cl.close.bind(cl)
                        }
                        initDb()
                    })
                    .then(() => Ok(this))
                    .catch((err) => {
                        debug(err)
                        Err(err)
                    })
            } else {
                debug('mongoClient.length !== 2')
                client = new mongo.MongoClient()
                client
                    .connect(connectionUrl, options.options)
                    .then((db) => {
                        this.db = db
                        initDb()
                    })
                    .then(() => Ok(this))
                    .catch((err) => {
                        debug(err)
                        Err(err)
                    })
            }

            const initDb = () => {
                this.db.on('close', () => {
                    this.emit('disconnect')
                    this.stopHeartbeat()
                })

                const finish = (err) => {
                    if (err) {
                        debug(err)
                        return
                    }

                    this.events = this.db.collection(options.eventsCollectionName)
                    this.events[ensureIndex]({ aggregateId: 1, streamRevision: 1 }, (err) => {
                        if (err) {
                            debug(err)
                        }
                    })
                    this.events[ensureIndex]({ commitStamp: 1 }, (err) => {
                        if (err) {
                            debug(err)
                        }
                    })
                    this.events[ensureIndex]({ dispatched: 1 }, { sparse: true }, (err) => {
                        if (err) {
                            debug(err)
                        }
                    })
                    this.events[ensureIndex](
                        { commitStamp: 1, streamRevision: 1, commitSequence: 1 },
                        (err) => {
                            if (err) {
                                debug(err)
                            }
                        }
                    )

                    this.snapshots = this.db.collection(options.snapshotsCollectionName)
                    this.snapshots[ensureIndex]({ aggregateId: 1, revision: -1 }, (err) => {
                        if (err) {
                            debug(err)
                        }
                    })

                    this.transactions = this.db.collection(options.transactionsCollectionName)
                    this.transactions[ensureIndex](
                        { aggregateId: 1, 'events.streamRevision': 1 },
                        (err) => {
                            if (err) {
                                debug(err)
                            }
                        }
                    )
                    this.events[ensureIndex](
                        {
                            aggregate: 1,
                            aggregateId: 1,
                            commitStamp: -1,
                            streamRevision: -1,
                            commitSequence: -1,
                        },
                        (err) => {
                            if (err) {
                                debug(err)
                            }
                        }
                    )

                    if (options.positionsCollectionName) {
                        this.positions = this.db.collection(options.positionsCollectionName)
                        this.positionsCounterId = options.eventsCollectionName
                    }

                    this.emit('connect')
                    if (this.options.heartbeat) {
                        this.startHeartbeat()
                    }
                }

                finish()
            }
        })
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
            delete this.heartbeatInterval
        }
    }

    startHeartbeat() {
        //

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

            if (!this.db) {
                Ok(this)
                return
            }

            this.db
                .close()
                .then(() => Ok(this))
                .catch((err) => (debug(err), Err(err)))
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
        return new Promise((Ok, Err) => {
            if (!this.positions) {
                debug('Positions not present')
                return Ok(null)
            }

            this.positions
                .findOneAndUpdate(
                    { _id: this.positionsCounterId },
                    { $inc: { position: positions } },
                    { returnOriginal: false, upsert: true }
                )
                .then(({ value }) => (value.position += 1))
                .then((position) => _.range(position - positions, position))
                .then(Ok, Err)
        })
    }

    addEvents(events) {
        return new Promise((Ok, Err) => {
            if (events.length === 0) {
                return Ok(this)
            }

            var commitId = events[0].commitId

            var noAggregateId = false,
                invalidCommitId = false

            _.forEach(events, (evt) => {
                if (!evt.aggregateId) {
                    noAggregateId = true
                }

                if (!evt.commitId || evt.commitId !== commitId) {
                    invalidCommitId = true
                }

                evt._id = evt.id
                evt.dispatched = false
            })

            if (noAggregateId) {
                var errMsg = 'aggregateId not defined!'
                debug(errMsg)
                return Err(new Error(errMsg))
            }

            if (invalidCommitId) {
                var errMsg = 'commitId not defined or different!'
                debug(errMsg)
                return Err(new Error(errMsg))
            }

            if (events.length === 1) {
                return this.events
                    .insertOne(events[0])
                    .then(() => this)
                    .then(Ok, Err)
            }

            var tx = {
                _id: commitId,
                events: events,
                aggregateId: events[0].aggregateId,
                aggregate: events[0].aggregate,
                context: events[0].context,
            }

            Promise.resolve(tx)
                .then(inspect('Inserting transaction %o'))
                .then((tx) => this.transactions.insertOne(tx))
                .then(notice('Inserting events'))
                .then(() => this.events.insertMany(events))
                .then(notice('removing transation'))
                .then(() => this.removeTransactions(events[events.length - 1]))
                .then(notice('Resolving'))
                .then(() => this)
                .then(Ok, Err)
        })
    }

    // streaming API
    streamEvents(query, skip, limit) {
        var findStatement = {}

        if (query.aggregate) {
            findStatement.aggregate = query.aggregate
        }

        if (query.context) {
            findStatement.context = query.context
        }

        if (query.aggregateId) {
            findStatement.aggregateId = query.aggregateId
        }

        var query = this.events.find(findStatement, {
            sort: [
                ['commitStamp', 'asc'],
                ['streamRevision', 'asc'],
                ['commitSequence', 'asc'],
            ],
        })

        if (skip) {
            query.skip(skip)
        }

        if (limit && limit > 0) {
            query.limit(limit)
        }

        return query
    }

    streamEventsSince(date, skip, limit) {
        var findStatement = { commitStamp: { $gte: date } }

        var query = this.events.find(findStatement, {
            sort: [
                ['commitStamp', 'asc'],
                ['streamRevision', 'asc'],
                ['commitSequence', 'asc'],
            ],
        })

        if (skip) query.skip(skip)

        if (limit && limit > 0) query.limit(limit)

        return query
    }

    streamEventsByRevision(query, revMin, revMax) {
        if (!query.aggregateId) {
            var errMsg = 'aggregateId not defined!'
            debug(errMsg)
            // FIXME: where does that callback come from?
            // if (callback) callback(new Error(errMsg))
            return
        }

        var findStatement = {
            aggregateId: query.aggregateId,
        }

        if (query.aggregate) {
            findStatement.aggregate = query.aggregate
        }

        if (query.context) {
            findStatement.context = query.context
        }

        var resultStream = new stream.PassThrough({ objectMode: true, highWaterMark: 1 })
        streamEventsByRevision(this, findStatement, revMin, revMax, resultStream)
        return resultStream
    }

    getEvents(query, skip, limit) {
        return new Promise((Ok, Err) => {
            this.streamEvents(query, skip, limit).toArray().then(Ok, Err)
        })
    }

    getEventsSince(date, skip, limit) {
        return new Promise((Ok, Err) => {
            this.streamEventsSince(date, skip, limit).toArray().then(Ok, Err)
        })
    }

    getEventsByRevision(query, revMin, revMax) {
        const removeAndResolve = (lastEvt, res) => this.removeTransactions(lastEvt).then(() => res)

        const repairAndRetry = (lastEvt) =>
            this.repairFailedTransaction(lastEvt).then(() =>
                this.getEventsByRevision(query, revMin, revMax)
            )

        const evaluatTransaction = (res) => {
            const lastEvt = res[res.length - 1]

            const txOk =
                (revMax === -1 && !lastEvt.restInCommitStream) ||
                (revMax !== -1 &&
                    (lastEvt.streamRevision === revMax - 1 || !lastEvt.restInCommitStream))

            return txOk ? removeAndResolve(lastEvt, res) : repairAndRetry(lastEvt)
        }

        return new Promise((Ok, Err) => {
            debug('getEventsByRevision(%s, %s, %s)', query, revMin, revMax)
            if (!query.aggregateId) {
                var errMsg = 'aggregateId not defined!'
                debug(errMsg)
                return Err(new Error(errMsg))
            }

            var streamRevOptions = { $gte: revMin, $lt: revMax }
            if (revMax === -1) {
                streamRevOptions = { $gte: revMin }
            }

            var findStatement = {
                aggregateId: query.aggregateId,
                streamRevision: streamRevOptions,
            }

            if (query.aggregate) {
                findStatement.aggregate = query.aggregate
            }

            if (query.context) {
                findStatement.context = query.context
            }

            this.events
                .find(findStatement, {
                    sort: [
                        ['commitStamp', 'asc'],
                        ['streamRevision', 'asc'],
                        ['commitSequence', 'asc'],
                    ],
                })
                .toArray()
                .then((res) => (!res || res.length === 0 ? [] : evaluatTransaction(res)))
                .then(Ok, Err)
        })
    }

    getUndispatchedEvents(query) {
        return new Promise((Ok, Err) => {
            var findStatement = {
                dispatched: false,
            }

            if (query && query.aggregate) {
                findStatement.aggregate = query.aggregate
            }

            if (query && query.context) {
                findStatement.context = query.context
            }

            if (query && query.aggregateId) {
                findStatement.aggregateId = query.aggregateId
            }

            this.events
                .find(findStatement, {
                    sort: [
                        ['commitStamp', 'asc'],
                        ['streamRevision', 'asc'],
                        ['commitSequence', 'asc'],
                    ],
                })
                .toArray()
                .then(Ok, Err)
        })
    }

    setEventToDispatched(id) {
        return new Promise((Ok, Err) => {
            var updateCommand = { $unset: { dispatched: null } }
            this.events
                .updateOne({ _id: id }, updateCommand)
                .then(({ result }) => result)
                .then(Ok, Err)
        })
    }

    addSnapshot(snap) {
        return new Promise((Ok, Err) => {
            if (!snap.aggregateId) {
                var errMsg = 'aggregateId not defined!'
                debug(errMsg)
                return Err(new Error(errMsg))
            }

            snap._id = snap.id
            this.snapshots
                .insertOne(snap)
                .then(({ result }) => result)
                .then(Ok, Err)
        })
    }

    cleanSnapshots(query) {
        return new Promise((Ok, Err) => {
            if (!query.aggregateId) {
                var errMsg = 'aggregateId not defined!'
                debug(errMsg)
                return Err(new Error(errMsg))
            }

            var findStatement = {
                aggregateId: query.aggregateId,
            }

            if (query.aggregate) {
                findStatement.aggregate = query.aggregate
            }

            if (query.context) {
                findStatement.context = query.context
            }

            const remove = (elements) =>
                Promise.all(elements.map(({ _id }) => this.snapshots.deleteOne({ _id })))

            const countRemaining = () => this.snapshots.count(findStatement)

            this.snapshots
                .find(findStatement, {
                    sort: [
                        ['revision', 'desc'],
                        ['version', 'desc'],
                        ['commitStamp', 'desc'],
                    ],
                })
                .skip(this.options.maxSnapshotsCount | 0)
                .toArray()
                .then(remove)
                .then(countRemaining)
                .then(Ok, Err)
        })
    }

    getSnapshot(query, revMax) {
        return new Promise((Ok, Err) => {
            if (!query.aggregateId) {
                var errMsg = 'aggregateId not defined!'
                debug(errMsg)
                return Err(new Error(errMsg))
            }

            var findStatement = {
                aggregateId: query.aggregateId,
            }

            if (query.aggregate) {
                findStatement.aggregate = query.aggregate
            }

            if (query.context) {
                findStatement.context = query.context
            }

            if (revMax > -1) {
                findStatement.revision = { $lte: revMax }
            }

            this.snapshots
                .findOne(findStatement, {
                    sort: [
                        ['revision', 'desc'],
                        ['version', 'desc'],
                        ['commitStamp', 'desc'],
                    ],
                })
                .then(Ok, Err)
        })
    }

    removeTransactions(evt) {
        return new Promise((Ok, Err) => {
            if (!evt.aggregateId) {
                var errMsg = 'aggregateId not defined!'
                debug(errMsg)
                return Err(new Error(errMsg))
            }

            var findStatement = { aggregateId: evt.aggregateId }

            if (evt.aggregate) {
                findStatement.aggregate = evt.aggregate
            }

            if (evt.context) {
                findStatement.context = evt.context
            }

            // the following is usually unnecessary
            this.transactions
                .deleteMany(findStatement)
                .then(() => this)
                .then(Ok, Err)
        })
    }

    getPendingTransactions() {
        const isFulfilled = ({ status }) => status === 'fulfilled'
        const eventNotPresent = ({ event }) => !Boolean(event)
        const eventPresent = ({ event }) => Boolean(event)
        const takeValue = ({ value }) => value
        const takeFulfilledValues = (results) => results.filter(isFulfilled).map(takeValue)

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
            Promise.all(xs.filter(eventNotPresent).map(removeTransaction))

        const removeEmptyTransactions = (xs) =>
            removeTransactionsWithoutEvent(xs).then(() => xs.filter(eventPresent))

        return new Promise((Ok, Err) => {
            this.transactions
                .find({})
                .toArray()
                .then((transactions) => findEvents(transactions))
                .then(removeEmptyTransactions)
                .then((xs) => xs.map(({ event }) => event))
                .then(inspect('pending events %o'))
                .then(Ok, Err)
            /*
            this.transactions.find({}).toArray((err, txs) => {
                if (err) {
                    debug(err)
                    return Err(err)
                }

                if (txs.length === 0) {
                    return Ok(txs)
                }

                var goodTxs = []

                async.map(
                    txs,
                    (tx, clb) => {
                        var findStatement = { commitId: tx._id, aggregateId: tx.aggregateId }

                        if (tx.aggregate) {
                            findStatement.aggregate = tx.aggregate
                        }

                        if (tx.context) {
                            findStatement.context = tx.context
                        }

                        this.events.findOne(findStatement, (err, evt) => {
                            if (err) {
                                return clb(err)
                            }

                            if (evt) {
                                goodTxs.push(evt)
                                return clb(null)
                            }

                            this.transactions.deleteOne({ _id: tx._id }, clb)
                        })
                    },
                    (err) => {
                        if (err) {
                            debug(err)
                            return callback(err), Err(err)
                        }

                        callback(null, goodTxs), Ok(goodTxs)
                    }
                )
            })
            */
        })
    }

    getLastEvent(query) {
        return new Promise((Ok, Err) => {
            if (!query.aggregateId) {
                var errMsg = 'aggregateId not defined!'
                debug(errMsg)
                return Err(new Error(errMsg))
            }

            var findStatement = { aggregateId: query.aggregateId }

            if (query.aggregate) {
                findStatement.aggregate = query.aggregate
            }

            if (query.context) {
                findStatement.context = query.context
            }

            this.events
                .findOne(findStatement, {
                    sort: [
                        ['commitStamp', 'desc'],
                        ['streamRevision', 'desc'],
                        ['commitSequence', 'desc'],
                    ],
                })
                .then(Ok, Err)
        })
    }

    repairFailedTransaction(lastEvt) {
        return new Promise((Ok, Err) => {
            debug('repairFailedTransaction with %o', lastEvt)
            this.transactions
                .findOne({ _id: lastEvt.commitId })
                .then((tx) => {
                    if (!tx) {
                        throw new Error('missing tx entry for aggregate ' + lastEvt.aggregateId)
                    }

                    return tx.events.slice(tx.events.length - lastEvt.restInCommitStream)
                })
                .then((missingEvts) => {
                    return this.events.insertMany(missingEvts)
                })
                .then(() => this.removeTransactions(lastEvt))
                .then(() => this)
                .then(Ok, Err)
        })
    }
}

module.exports = Mongo
