var Store = require('../base'),
    _ = require('lodash'),
    async = require('async'),
    stream = require('stream'),
    mongo = Store.use('mongodb'),
    ObjectID = mongo.ObjectID,
    debug = require('debug')('eventstore:store:mongodb')

const noop = () => {}

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

            self.repairFailedTransaction(lastEvent, (err) => {
                if (err) {
                    if (err.message.indexOf('missing tx entry') >= 0) {
                        return resultStream.end(lastEvent) // Maybe we should check on this line too?
                    }
                    debug(err)
                    return resultStream.destroy(error)
                }

                streamEventsByRevision(
                    self,
                    findStatement,
                    lastEvent.revMin,
                    revMax,
                    resultStream,
                    lastEvent
                )
            })
        }
    )
}

const removeElements =
    (collection, callback = noop) =>
    (error, elements) => {
        if (error) {
            debug(error)
            return callback(error)
        }
        async.each(
            elements,
            (element, callback) => {
                try {
                    collection.deleteOne({ _id: element._id })
                    callback()
                } catch (error) {
                    callback(error)
                }
            },
            (error) => {
                callback(error, elements.length)
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

    connect(callback = noop) {
        //

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
            ensureIndex = 'createIndex'
            client = new mongo.MongoClient(connectionUrl, options.options)
            client.connect((err, cl) => {
                if (err) {
                    debug(err)
                    callback(err)
                    return
                }

                this.db = cl.db(cl.s.options.dbName)
                if (!this.db.close) {
                    this.db.close = cl.close.bind(cl)
                }
                initDb()
            })
        } else {
            client = new mongo.MongoClient()
            client.connect(connectionUrl, options.options, (err, db) => {
                if (err) {
                    debug(err)
                    callback(err)
                    return
                }

                this.db = db
                initDb()
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
                    callback(err)
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
                callback(null, this)
            }

            finish()
        }
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

    disconnect(callback = noop) {
        this.stopHeartbeat()

        if (!this.db) {
            callback(null)
            return
        }

        this.db.close((err) => {
            if (err) {
                debug(err)
            }
            callback(err)
        })
    }

    clear(callback = noop) {
        async.parallel(
            [
                (callback) => {
                    this.events.deleteMany({}, callback)
                },
                (callback) => {
                    this.snapshots.deleteMany({}, callback)
                },
                (callback) => {
                    this.transactions.deleteMany({}, callback)
                },
                (callback) => {
                    if (!this.positions) return callback(null)
                    this.positions.deleteMany({}, callback)
                },
            ],
            (err) => {
                if (err) {
                    debug(err)
                }
                callback(err)
            }
        )
    }

    getNewId(callback) {
        callback(null, new ObjectID().toString())
    }

    getNextPositions(positions, callback = noop) {
        if (!this.positions) return callback(null)

        this.positions.findOneAndUpdate(
            { _id: this.positionsCounterId },
            { $inc: { position: positions } },
            { returnOriginal: false, upsert: true },
            (err, pos) => {
                if (err) return callback(err)

                pos.value.position += 1

                callback(null, _.range(pos.value.position - positions, pos.value.position))
            }
        )
    }

    addEvents(events, callback = noop) {
        if (events.length === 0) {
            callback(null)

            return
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
            callback(new Error(errMsg))
            return
        }

        if (invalidCommitId) {
            var errMsg = 'commitId not defined or different!'
            debug(errMsg)
            callback(new Error(errMsg))
            return
        }

        if (events.length === 1) {
            return this.events.insertOne(events[0], callback)
        }

        var tx = {
            _id: commitId,
            events: events,
            aggregateId: events[0].aggregateId,
            aggregate: events[0].aggregate,
            context: events[0].context,
        }

        this.transactions.insertOne(tx, (err) => {
            if (err) {
                debug(err)
                callback(err)
                return
            }

            this.events.insertMany(events, (err) => {
                if (err) {
                    debug(err)
                    callback(err)
                    return
                }

                this.removeTransactions(events[events.length - 1], callback)
            })
        })
        // });
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

    getEvents(query, skip, limit, callback) {
        this.streamEvents(query, skip, limit).toArray(callback)
    }

    getEventsSince(date, skip, limit, callback) {
        this.streamEventsSince(date, skip, limit).toArray(callback)
    }

    getEventsByRevision(query, revMin, revMax, callback = noop) {
        if (!query.aggregateId) {
            var errMsg = 'aggregateId not defined!'
            debug(errMsg)
            callback(new Error(errMsg))
            return
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
            .toArray((err, res) => {
                if (err) {
                    debug(err)
                    return callback(err)
                }

                if (!res || res.length === 0) {
                    return callback(null, [])
                }

                var lastEvt = res[res.length - 1]

                var txOk =
                    (revMax === -1 && !lastEvt.restInCommitStream) ||
                    (revMax !== -1 &&
                        (lastEvt.streamRevision === revMax - 1 || !lastEvt.restInCommitStream))

                if (txOk) {
                    // the following is usually unnecessary
                    this.removeTransactions(lastEvt)

                    return callback(null, res)
                }

                this.repairFailedTransaction(lastEvt, (err) => {
                    if (err) {
                        if (err.message.indexOf('missing tx entry') >= 0) {
                            return callback(null, res)
                        }
                        debug(err)
                        return callback(err)
                    }

                    this.getEventsByRevision(query, revMin, revMax, callback)
                })
            })
    }

    getUndispatchedEvents(query, callback = noop) {
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
            .toArray(callback)
    }

    setEventToDispatched(id, callback = noop) {
        var updateCommand = { $unset: { dispatched: null } }
        this.events.updateOne({ _id: id }, updateCommand, callback)
    }

    addSnapshot(snap, callback) {
        if (!snap.aggregateId) {
            var errMsg = 'aggregateId not defined!'
            debug(errMsg)
            callback(new Error(errMsg))
            return
        }

        snap._id = snap.id
        this.snapshots.insertOne(snap, callback)
    }

    cleanSnapshots(query, callback = noop) {
        if (!query.aggregateId) {
            var errMsg = 'aggregateId not defined!'
            debug(errMsg)
            callback(new Error(errMsg))
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

        this.snapshots
            .find(findStatement, {
                sort: [
                    ['revision', 'desc'],
                    ['version', 'desc'],
                    ['commitStamp', 'desc'],
                ],
            })
            .skip(this.options.maxSnapshotsCount)
            .toArray(removeElements(this.snapshots, callback))
    }

    getSnapshot(query, revMax, callback = noop) {
        if (!query.aggregateId) {
            var errMsg = 'aggregateId not defined!'
            debug(errMsg)
            callback(new Error(errMsg))
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

        if (revMax > -1) {
            findStatement.revision = { $lte: revMax }
        }

        this.snapshots.findOne(
            findStatement,
            {
                sort: [
                    ['revision', 'desc'],
                    ['version', 'desc'],
                    ['commitStamp', 'desc'],
                ],
            },
            callback
        )
    }

    removeTransactions(evt, callback = noop) {
        if (!evt.aggregateId) {
            var errMsg = 'aggregateId not defined!'
            debug(errMsg)
            callback(new Error(errMsg))
            return
        }

        var findStatement = { aggregateId: evt.aggregateId }

        if (evt.aggregate) {
            findStatement.aggregate = evt.aggregate
        }

        if (evt.context) {
            findStatement.context = evt.context
        }

        // the following is usually unnecessary
        this.transactions.deleteMany(findStatement, (err) => {
            if (err) {
                debug(err)
            }
            callback(err)
        })
    }

    getPendingTransactions(callback = noop) {
        //
        this.transactions.find({}).toArray((err, txs) => {
            if (err) {
                debug(err)
                return callback(err)
            }

            if (txs.length === 0) {
                return callback(null, txs)
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
                        return callback(err)
                    }

                    callback(null, goodTxs)
                }
            )
        })
    }

    getLastEvent(query, callback = noop) {
        if (!query.aggregateId) {
            var errMsg = 'aggregateId not defined!'
            debug(errMsg)
            callback(new Error(errMsg))
            return
        }

        var findStatement = { aggregateId: query.aggregateId }

        if (query.aggregate) {
            findStatement.aggregate = query.aggregate
        }

        if (query.context) {
            findStatement.context = query.context
        }

        this.events.findOne(
            findStatement,
            {
                sort: [
                    ['commitStamp', 'desc'],
                    ['streamRevision', 'desc'],
                    ['commitSequence', 'desc'],
                ],
            },
            callback
        )
    }

    repairFailedTransaction(lastEvt, callback = noop) {
        //

        this.transactions.findOne({ _id: lastEvt.commitId }, (err, tx) => {
            if (err) {
                debug(err)
                return callback(err)
            }

            if (!tx) {
                var err = new Error('missing tx entry for aggregate ' + lastEvt.aggregateId)
                debug(err)
                return callback(err)
            }

            var missingEvts = tx.events.slice(tx.events.length - lastEvt.restInCommitStream)

            this.events.insertMany(missingEvts, (err) => {
                if (err) {
                    debug(err)
                    return callback(err)
                }

                this.removeTransactions(lastEvt)

                callback(null)
            })
        })
    }
}

module.exports = Mongo
