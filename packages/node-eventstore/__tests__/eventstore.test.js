const eventstore = require('..')
const InMemory = require('../lib/databases/inmemory')
const Base = require('../lib/base')
const Eventstore = require('../lib/eventstore')
const debug = require('debug')('@avanzu/eventstore/tests')

describe('eventstore', () => {
    it('it should be a function', () => {
        expect(eventstore).toBeInstanceOf(Function)
    })

    it('it should exposed the Base for the Store implementation', () => {
        expect(eventstore.Store).toEqual(Base)
    })

    describe('calling that function', () => {
        describe('without options', () => {
            it('it should return as expected', () => {
                var es = eventstore()
                expect(es).toBeInstanceOf(Eventstore)
                expect(es.useEventPublisher).toBeInstanceOf(Function)
                expect(es.init).toBeInstanceOf(Function)
                expect(es.streamEvents).toBeInstanceOf(Function)
                expect(es.streamEventsSince).toBeInstanceOf(Function)
                expect(es.streamEventsByRevision).toBeInstanceOf(Function)
                expect(es.getEvents).toBeInstanceOf(Function)
                expect(es.getEventsSince).toBeInstanceOf(Function)
                expect(es.getEventsByRevision).toBeInstanceOf(Function)
                expect(es.getEventStream).toBeInstanceOf(Function)
                expect(es.getFromSnapshot).toBeInstanceOf(Function)
                expect(es.createSnapshot).toBeInstanceOf(Function)
                expect(es.commit).toBeInstanceOf(Function)
                expect(es.getUndispatchedEvents).toBeInstanceOf(Function)
                expect(es.setEventToDispatched).toBeInstanceOf(Function)
                expect(es.getNewId).toBeInstanceOf(Function)

                expect(es.store).toBeInstanceOf(InMemory)
            })
        })

        describe('with options of a non existing db implementation', () => {
            it('it should throw an error', () => {
                expect(() => {
                    eventstore({ type: 'strangeDb' })
                }).toThrowError()
            })
        })

        describe('with options of an own db implementation', () => {
            it('it should return with the an instance of that implementation', () => {
                var es = eventstore({ type: InMemory })
                expect(es).toBeInstanceOf(Eventstore)
                expect(es.useEventPublisher).toBeInstanceOf(Function)
                expect(es.init).toBeInstanceOf(Function)
                expect(es.streamEvents).toBeInstanceOf(Function)
                expect(es.getEvents).toBeInstanceOf(Function)
                expect(es.getEventsByRevision).toBeInstanceOf(Function)
                expect(es.getEventStream).toBeInstanceOf(Function)
                expect(es.getFromSnapshot).toBeInstanceOf(Function)
                expect(es.createSnapshot).toBeInstanceOf(Function)
                expect(es.commit).toBeInstanceOf(Function)
                expect(es.getUndispatchedEvents).toBeInstanceOf(Function)
                expect(es.setEventToDispatched).toBeInstanceOf(Function)
                expect(es.getNewId).toBeInstanceOf(Function)

                expect(es.store).toBeInstanceOf(InMemory)
            })
        })

        describe('and checking the api function by calling', () => {
            describe('getEvents', () => {
                var es = eventstore(),
                    orgFunc = es.store.getEvents

                beforeEach((done) => {
                    es.init(done)
                })

                afterEach(() => {
                    es.store.getEvents = orgFunc
                })

                describe('with nice arguments', () => {
                    it('it should pass them correctly', (done) => {
                        var given = {
                            query: {
                                aggregateId: 'myAggId',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            },
                            skip: 2,
                            limit: 32,
                            callback: () => {},
                        }

                        es.store.getEvents = function (query, skip, limit, callback) {
                            expect(query).toEqual(given.query)
                            expect(skip).toEqual(given.skip)
                            expect(limit).toEqual(given.limit)
                            expect(callback).toBeInstanceOf(Function)

                            done()
                        }

                        es.getEvents(given.query, given.skip, given.limit, given.callback)
                    })
                })

                describe('with only the callback', () => {
                    it('it should pass them correctly', (done) => {
                        var given = {
                            callback: () => {},
                        }

                        es.store.getEvents = function (query, skip, limit, callback) {
                            expect(query).toBeInstanceOf(Object)
                            expect(query).toEqual({})
                            expect(skip).toEqual(0)
                            expect(limit).toEqual(-1)
                            expect(callback).toBeInstanceOf(Function)

                            done()
                        }

                        es.getEvents(given.callback)
                    })
                })

                describe('with query and callback', () => {
                    it('it should pass them correctly', (done) => {
                        var given = {
                            query: {
                                aggregateId: 'myAggId',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            },
                            callback: () => {},
                        }

                        es.store.getEvents = function (query, skip, limit, callback) {
                            expect(query).toEqual(given.query)
                            expect(skip).toEqual(0)
                            expect(limit).toEqual(-1)
                            expect(callback).toBeInstanceOf(Function)

                            done()
                        }

                        es.getEvents(given.query, given.callback)
                    })
                })

                describe('with skip and callback', () => {
                    it('it should pass them correctly', (done) => {
                        var given = {
                            skip: 3,
                            callback: () => {},
                        }

                        es.store.getEvents = function (query, skip, limit, callback) {
                            expect(query).toBeInstanceOf(Object)
                            expect(query).toEqual({})
                            expect(skip).toEqual(given.skip)
                            expect(limit).toEqual(-1)
                            expect(callback).toBeInstanceOf(Function)

                            done()
                        }

                        es.getEvents(given.skip, given.callback)
                    })
                })

                describe('with query, skip and callback', () => {
                    it('it should pass them correctly', (done) => {
                        var given = {
                            query: {
                                aggregateId: 'myAggId',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            },
                            skip: 3,
                            callback: () => {},
                        }

                        es.store.getEvents = function (query, skip, limit, callback) {
                            expect(query).toEqual(given.query)
                            expect(skip).toEqual(given.skip)
                            expect(limit).toEqual(-1)
                            expect(callback).toBeInstanceOf(Function)

                            done()
                        }

                        es.getEvents(given.query, given.skip, given.callback)
                    })
                })

                describe('with skip, limit and callback', () => {
                    it('it should pass them correctly', (done) => {
                        var given = {
                            skip: 3,
                            limit: 50,
                            callback: () => {},
                        }

                        es.store.getEvents = function (query, skip, limit, callback) {
                            expect(query).toBeInstanceOf(Object)
                            expect(query).toEqual({})
                            expect(skip).toEqual(given.skip)
                            expect(limit).toEqual(given.limit)
                            expect(callback).toBeInstanceOf(Function)

                            done()
                        }

                        es.getEvents(given.skip, given.limit, given.callback)
                    })
                })

                describe('with query as string,  skip, limit and callback', () => {
                    it('it should pass them correctly', (done) => {
                        var given = {
                            query: 'myAggId',
                            skip: 3,
                            limit: 50,
                            callback: () => {},
                        }

                        es.store.getEvents = function (query, skip, limit, callback) {
                            expect(query).toBeInstanceOf(Object)
                            expect(query.aggregateId).toEqual('myAggId')
                            expect(skip).toEqual(given.skip)
                            expect(limit).toEqual(given.limit)
                            expect(callback).toBeInstanceOf(Function)

                            done()
                        }

                        es.getEvents(given.query, given.skip, given.limit, given.callback)
                    })
                })
            })

            describe('getEventsByRevision', () => {
                var es = eventstore(),
                    orgFunc = es.store.getEventsByRevision

                beforeEach((done) => {
                    es.init(done)
                })

                afterEach(() => {
                    es.store.getEventsByRevision = orgFunc
                })

                describe('with nice arguments', () => {
                    it('it should pass them correctly', (done) => {
                        var given = {
                            query: {
                                aggregateId: 'myAggId',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            },
                            revMin: 2,
                            revMax: 32,
                            callback: () => {},
                        }

                        es.store.getEventsByRevision = function (query, revMin, revMax, callback) {
                            expect(query).toEqual(given.query)
                            expect(revMin).toEqual(given.revMin)
                            expect(revMax).toEqual(given.revMax)
                            expect(callback).toBeInstanceOf(Function)

                            done()
                        }

                        es.getEventsByRevision(
                            given.query,
                            given.revMin,
                            given.revMax,
                            given.callback
                        )
                    })
                })

                describe('with query and callback', () => {
                    it('it should pass them correctly', (done) => {
                        var given = {
                            query: {
                                aggregateId: 'myAggId',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            },
                            callback: () => {},
                        }

                        es.store.getEventsByRevision = function (query, revMin, revMax, callback) {
                            expect(query).toEqual(given.query)
                            expect(revMin).toEqual(0)
                            expect(revMax).toEqual(-1)
                            expect(callback).toBeInstanceOf(Function)

                            done()
                        }

                        es.getEventsByRevision(given.query, given.callback)
                    })
                })

                describe('with query, revMin and callback', () => {
                    it('it should pass them correctly', (done) => {
                        var given = {
                            query: {
                                aggregateId: 'myAggId',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            },
                            revMin: 2,
                            callback: () => {},
                        }

                        es.store.getEventsByRevision = function (query, revMin, revMax, callback) {
                            expect(query).toEqual(given.query)
                            expect(revMin).toEqual(given.revMin)
                            expect(revMax).toEqual(-1)
                            expect(callback).toBeInstanceOf(Function)

                            done()
                        }

                        es.getEventsByRevision(given.query, given.revMin, given.callback)
                    })
                })

                describe('with query as string, revMin, revMax and callback', () => {
                    it('it should pass them correctly', (done) => {
                        var given = {
                            query: 'myAggId',
                            revMin: 2,
                            revMax: 4,
                            callback: () => {},
                        }

                        es.store.getEventsByRevision = function (query, revMin, revMax, callback) {
                            expect(query).toBeInstanceOf(Object)
                            expect(query.aggregateId).toEqual('myAggId')
                            expect(revMin).toEqual(given.revMin)
                            expect(revMax).toEqual(given.revMax)
                            expect(callback).toBeInstanceOf(Function)

                            done()
                        }

                        es.getEventsByRevision(
                            given.query,
                            given.revMin,
                            given.revMax,
                            given.callback
                        )
                    })
                })

                describe('with wrong query', () => {
                    it('it should pass them correctly', (done) => {
                        es.getEventsByRevision(123, 3, 100, function (err) {
                            expect(err.message).toMatch(/aggregateId/)
                            done()
                        })
                    })
                })
            })

            describe('getEventStream', () => {
                var es = eventstore(),
                    orgFunc = es.store.getEventsByRevision

                beforeEach((done) => {
                    es.init(done)
                })

                afterEach(() => {
                    es.store.getEventsByRevision = orgFunc
                })

                describe('with nice arguments', () => {
                    it('it should pass them correctly', (done) => {
                        var given = {
                            query: {
                                aggregateId: 'myAggId',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            },
                            revMin: 2,
                            revMax: 32,
                            callback: () => {},
                        }

                        es.store.getEventsByRevision = function (query, revMin, revMax, callback) {
                            expect(query).toEqual(given.query)
                            expect(revMin).toEqual(given.revMin)
                            expect(revMax).toEqual(given.revMax)
                            expect(callback).toBeInstanceOf(Function)

                            done()
                        }

                        es.getEventStream(given.query, given.revMin, given.revMax, given.callback)
                    })
                })

                describe('with query and callback', () => {
                    it('it should pass them correctly', (done) => {
                        var given = {
                            query: {
                                aggregateId: 'myAggId',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            },
                            callback: () => {},
                        }

                        es.store.getEventsByRevision = function (query, revMin, revMax, callback) {
                            expect(query).toEqual(given.query)
                            expect(revMin).toEqual(0)
                            expect(revMax).toEqual(-1)
                            expect(callback).toBeInstanceOf(Function)

                            done()
                        }

                        es.getEventStream(given.query, given.callback)
                    })
                })

                describe('with query, revMin and callback', () => {
                    it('it should pass them correctly', (done) => {
                        var given = {
                            query: {
                                aggregateId: 'myAggId',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            },
                            revMin: 2,
                            callback: () => {},
                        }

                        es.store.getEventsByRevision = function (query, revMin, revMax, callback) {
                            expect(query).toEqual(given.query)
                            expect(revMin).toEqual(given.revMin)
                            expect(revMax).toEqual(-1)
                            expect(callback).toBeInstanceOf(Function)

                            done()
                        }

                        es.getEventStream(given.query, given.revMin, given.callback)
                    })
                })

                describe('with query as string, revMin, revMax and callback', () => {
                    it('it should pass them correctly', (done) => {
                        var given = {
                            query: 'myAggId',
                            revMin: 2,
                            revMax: 4,
                            callback: () => {},
                        }

                        es.store.getEventsByRevision = function (query, revMin, revMax, callback) {
                            expect(query).toBeInstanceOf(Object)
                            expect(query.aggregateId).toEqual('myAggId')
                            expect(revMin).toEqual(given.revMin)
                            expect(revMax).toEqual(given.revMax)
                            expect(callback).toBeInstanceOf(Function)

                            done()
                        }

                        es.getEventStream(given.query, given.revMin, given.revMax, given.callback)
                    })
                })

                describe('with wrong query', () => {
                    it('it should pass them correctly', (done) => {
                        es.getEventStream(123, 3, 100, function (err) {
                            expect(err.message).toMatch(/aggregateId/)
                            done()
                        })
                    })
                })
            })

            describe('getFromSnapshot', () => {
                var es = eventstore(),
                    orgFunc = es.store.getSnapshot

                beforeEach((done) => {
                    es.init(done)
                })

                afterEach(() => {
                    es.store.getSnapshot = orgFunc
                })

                describe('with nice arguments', () => {
                    it('it should pass them correctly', (done) => {
                        var given = {
                            query: {
                                aggregateId: 'myAggId',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            },
                            revMax: 32,
                            callback: () => {},
                        }

                        es.store.getSnapshot = function (query, revMax, callback) {
                            expect(query).toEqual(given.query)
                            expect(revMax).toEqual(given.revMax)
                            expect(callback).toBeInstanceOf(Function)

                            done()
                        }

                        es.getFromSnapshot(given.query, given.revMax, given.callback)
                    })
                })

                describe('with query and callback', () => {
                    it('it should pass them correctly', (done) => {
                        var given = {
                            query: {
                                aggregateId: 'myAggId',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            },
                            callback: () => {},
                        }

                        es.store.getSnapshot = function (query, revMax, callback) {
                            expect(query).toEqual(given.query)
                            expect(revMax).toEqual(-1)
                            expect(callback).toBeInstanceOf(Function)

                            done()
                        }

                        es.getFromSnapshot(given.query, given.callback)
                    })

                    describe('with query as string, revMax and callback', () => {
                        it('it should pass them correctly', (done) => {
                            var given = {
                                query: 'myAggId',
                                revMax: 31,
                                callback: () => {},
                            }

                            es.store.getSnapshot = function (query, revMax, callback) {
                                expect(query).toBeInstanceOf(Object)
                                expect(query.aggregateId).toEqual('myAggId')
                                expect(revMax).toEqual(31)
                                expect(callback).toBeInstanceOf(Function)

                                done()
                            }

                            es.getFromSnapshot(given.query, given.revMax, given.callback)
                        })
                    })

                    describe('with wrong query', () => {
                        it('it should pass them correctly', (done) => {
                            es.getFromSnapshot(123, 100, function (err) {
                                expect(err.message).toMatch(/aggregateId/)
                                done()
                            })
                        })
                    })
                })
            })

            describe('createSnapshot', () => {
                var es = eventstore(),
                    orgFunc = es.store.addSnapshot

                beforeEach((done) => {
                    es.init(done)
                })

                afterEach(() => {
                    es.store.addSnapshot = orgFunc
                })

                describe('with nice arguments', () => {
                    it('it should pass them correctly', (done) => {
                        var obj = {
                            aggregateId: 'myAggId',
                            aggregate: 'myAgg',
                            context: 'myCont',
                            data: { snap: 'data' },
                        }

                        es.store.addSnapshot = function (snap, callback) {
                            expect(snap.aggregateId).toEqual(obj.aggregateId)
                            expect(snap.aggregate).toEqual(obj.aggregate)
                            expect(snap.context).toEqual(obj.context)
                            expect(snap.data).toEqual(obj.data)
                            expect(callback).toBeInstanceOf(Function)

                            done()
                        }

                        es.createSnapshot(obj, () => {})
                    })
                })

                describe('with streamId', () => {
                    it('it should pass them correctly', (done) => {
                        var obj = {
                            streamId: 'myAggId',
                            data: { snap: 'data' },
                        }

                        es.store.addSnapshot = function (snap, callback) {
                            expect(snap.aggregateId).toEqual(obj.streamId)
                            expect(snap.data).toEqual(obj.data)
                            expect(callback).toBeInstanceOf(Function)

                            done()
                        }

                        es.createSnapshot(obj, () => {})
                    })
                })

                describe('with wrong aggregateId', () => {
                    it('it should pass them correctly', (done) => {
                        var obj = {
                            data: { snap: 'data' },
                        }

                        es.createSnapshot(obj, function (err) {
                            expect(err.message).toMatch(/aggregateId/)
                            done()
                        })
                    })
                })

                describe('with wrong data', () => {
                    it('it should pass them correctly', (done) => {
                        var obj = {
                            aggregateId: 'myAggId',
                            aggregate: 'myAgg',
                            context: 'myCont',
                        }

                        es.createSnapshot(obj, function (err) {
                            expect(err.message).toMatch(/data/)
                            done()
                        })
                    })
                })
            })

            describe('cleanSnapshots', () => {
                var es = eventstore({
                        maxSnapshotsCount: 5,
                    }),
                    orgFunc = es.store.cleanSnapshots,
                    addSnapshot = es.store.addSnapshot

                beforeEach((done) => {
                    es.store.addSnapshot = function (snap, callback) {
                        callback()
                    }
                    es.init(done)
                })

                afterEach(() => {
                    es.store.cleanSnapshots = orgFunc
                    es.store.addSnapshot = addSnapshot
                })

                describe('with streamId', () => {
                    it('it should pass them correctly', (done) => {
                        var obj = {
                            streamId: 'myAggId',
                            aggregate: 'myAgg',
                            context: 'myCont',
                            data: { snap: 'data' },
                        }

                        es.store.cleanSnapshots = function (query, callback) {
                            expect(query.aggregateId).toEqual(obj.streamId)
                            expect(query.aggregate).toEqual(obj.aggregate)
                            expect(query.context).toEqual(obj.context)
                            expect(callback).toBeInstanceOf(Function)
                            callback()
                        }

                        es.createSnapshot(obj, done)
                    })
                })

                describe('with options not activated', () => {
                    beforeEach(() => {
                        es.options.maxSnapshotsCount = 0
                    })

                    it('it should not clean snapshots', (done) => {
                        var obj = {
                            streamId: 'myAggId',
                            aggregate: 'myAgg',
                            context: 'myCont',
                            data: { snap: 'data' },
                        }

                        es.store.cleanSnapshots = function (query, callback) {
                            callback(new Error('clean snapshots should not have been called'))
                        }

                        es.createSnapshot(obj, done)
                    })
                })
            })

            describe('setEventToDispatched', () => {
                var es = eventstore(),
                    orgFunc = es.store.setEventToDispatched

                beforeEach((done) => {
                    es.init(done)
                })

                afterEach(() => {
                    es.store.setEventToDispatched = orgFunc
                })

                describe('with an event', () => {
                    it('it should pass it correctly', (done) => {
                        var evt = {
                            commitId: '1234',
                        }

                        es.store.setEventToDispatched = function (id, callback) {
                            expect(id).toEqual(evt.id)
                            expect(callback).toBeInstanceOf(Function)

                            done()
                        }

                        es.setEventToDispatched(evt, () => {})
                    })
                })

                describe('with a commitId', () => {
                    it('it should pass it correctly', (done) => {
                        var evt = {
                            commitId: '1234',
                        }

                        es.store.setEventToDispatched = function (id, callback) {
                            expect(id).toEqual(evt.commitId)
                            expect(callback).toBeInstanceOf(Function)

                            done()
                        }

                        es.setEventToDispatched(evt.commitId, () => {})
                    })
                })
            })
        })

        describe('with options containing a type property with the value of', () => {
            var types = [
                ['inmemory', { type: 'inmemory' }],
                [
                    'mongodb',
                    {
                        type: 'mongodb',
                        host: process.env.__MONGO_HOST__,
                        port: process.env.__MONGO_PORT__,
                    },
                ],
                // [
                //     'redis',
                //     {
                //         type: 'redis',
                //         db: 3,
                //         host: process.env.__REDIS_HOST__,
                //         port: process.env.__REDIS_PORT__,
                //     },
                // ],
            ]
            var streamingApiTypes = ['mongodb']
            var positionTypes = ['mongodb', 'inmemory']

            //            types.forEach(function (type) {
            describe.each(types)('Type %s', (type, options) => {
                debug('Implementation of ', type)
                var es = null

                beforeAll(() => {
                    debug(type, options)
                })

                afterAll((done) => {
                    done(null)
                })

                describe('calling init without callback', () => {
                    afterEach((done) => {
                        es.store.disconnect(done)
                    })

                    beforeEach(() => {
                        es = eventstore(options)
                    })

                    it('it should emit connect', (done) => {
                        es.init()
                        es.once('connect', done)
                    })
                })

                describe('calling init with callback', () => {
                    afterEach((done) => {
                        es.store.disconnect(done)
                    })

                    beforeEach(() => {
                        es = eventstore(options)
                    })

                    it('it should callback successfully', (done) => {
                        es.init(function (err) {
                            expect(err).not.toBeTruthy()
                            done()
                        })
                    })
                })

                describe('having initialized (connected)', () => {
                    describe('calling disconnect on store', () => {
                        beforeEach((done) => {
                            es = eventstore(options)
                            es.init(done)
                        })

                        it('it should callback successfully', (done) => {
                            es.store.disconnect(function (err) {
                                expect(err).not.toBeTruthy()
                                done()
                            })
                        })

                        it('it should emit disconnect', (done) => {
                            es.once('disconnect', done)
                            es.store.disconnect()
                        })
                    })

                    describe('using the eventstore', () => {
                        beforeAll((done) => {
                            es = eventstore(options)
                            es.init(function () {
                                es.store.clear(done)
                            })
                        })

                        afterAll((done) => {
                            es.store.clear(done)
                        })

                        describe('calling getNewId', () => {
                            it('it should callback with a new Id as string', (done) => {
                                es.getNewId(function (err, id) {
                                    expect(err).not.toBeTruthy()
                                    expect(id).toMatch(/.+/)
                                    done()
                                })
                            })
                        })

                        describe('requesting a new eventstream', () => {
                            describe('and committing some new events', () => {
                                it('it should work as expected', (done) => {
                                    es.getEventStream(
                                        {
                                            aggregateId: 'myAggId',
                                            aggregate: 'myAgg',
                                            context: 'myCont',
                                        },
                                        function (err, stream) {
                                            expect(err).not.toBeTruthy()

                                            expect(stream.lastRevision).toEqual(-1)

                                            stream.addEvents([
                                                { one: 'event1' },
                                                { two: 'event2' },
                                                { three: 'event3' },
                                            ])

                                            expect(stream.streamId).toEqual('myAggId')
                                            expect(stream.uncommittedEvents.length).toEqual(3)
                                            expect(stream.events.length).toEqual(0)
                                            expect(stream.lastRevision).toEqual(-1)

                                            stream.commit(function (err, str) {
                                                expect(err).not.toBeTruthy()
                                                expect(str).toEqual(stream)

                                                expect(str.uncommittedEvents.length).toEqual(0)
                                                expect(str.events.length).toEqual(3)
                                                expect(str.lastRevision).toEqual(2)

                                                expect(str.events[0].commitSequence).toEqual(0)
                                                expect(str.events[1].commitSequence).toEqual(1)
                                                expect(str.events[2].commitSequence).toEqual(2)

                                                expect(str.events[0].restInCommitStream).toEqual(2)
                                                expect(str.events[1].restInCommitStream).toEqual(1)
                                                expect(str.events[2].restInCommitStream).toEqual(0)

                                                expect(str.eventsToDispatch.length).toEqual(3)

                                                done()
                                            })
                                        }
                                    )
                                })
                            })
                        })

                        describe('requesting an existing eventstream', () => {
                            describe('and committing some new events', () => {
                                beforeEach((done) => {
                                    es.getEventStream(
                                        {
                                            aggregateId: 'myAggId2',
                                            aggregate: 'myAgg',
                                            context: 'myCont',
                                        },
                                        function (err, stream) {
                                            expect(err).not.toBeTruthy()

                                            stream.addEvents([
                                                { one: 'event1' },
                                                { two: 'event2' },
                                                { three: 'event3' },
                                            ])
                                            stream.commit(done)
                                        }
                                    )
                                })

                                it('it should work as expected', (done) => {
                                    es.getEventStream(
                                        {
                                            aggregateId: 'myAggId2',
                                            aggregate: 'myAgg',
                                            context: 'myCont',
                                        },
                                        function (err, stream) {
                                            expect(err).not.toBeTruthy()

                                            expect(stream.lastRevision).toEqual(2)

                                            stream.addEvents([
                                                { for: 'event4' },
                                                { five: 'event5' },
                                            ])

                                            expect(stream.streamId).toEqual('myAggId2')
                                            expect(stream.uncommittedEvents.length).toEqual(2)
                                            expect(stream.events.length).toEqual(3)
                                            expect(stream.lastRevision).toEqual(2)

                                            stream.commit(function (err, str) {
                                                expect(err).not.toBeTruthy()
                                                expect(str).toEqual(stream)

                                                expect(str.uncommittedEvents.length).toEqual(0)
                                                expect(str.events.length).toEqual(5)
                                                expect(str.lastRevision).toEqual(4)

                                                expect(str.events[3].commitSequence).toEqual(0)
                                                expect(str.events[4].commitSequence).toEqual(1)

                                                expect(str.events[3].restInCommitStream).toEqual(1)
                                                expect(str.events[4].restInCommitStream).toEqual(0)

                                                expect(str.eventsToDispatch.length).toEqual(2)

                                                done()
                                            })
                                        }
                                    )
                                })

                                it('it should be able to retrieve them', (done) => {
                                    es.getEvents(
                                        {
                                            aggregateId: 'myAggId2',
                                            aggregate: 'myAgg',
                                            context: 'myCont',
                                        },
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(8)

                                            done()
                                        }
                                    )
                                })

                                it('it should be able to retrieve by context', (done) => {
                                    es.getEvents({ context: 'myCont' }, function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(14)

                                        done()
                                    })
                                })
                            })
                        })

                        describe('requesting existing events and using next function', () => {
                            describe('and committing some new events', () => {
                                it('it should work as expected', (done) => {
                                    es.getEvents(
                                        { aggregate: 'myAgg', context: 'myCont' },
                                        0,
                                        3,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()

                                            expect(evts.length).toEqual(3)

                                            expect(evts.next).toBeInstanceOf(Function)

                                            evts.next(function (err, nextEvts) {
                                                expect(err).not.toBeTruthy()

                                                expect(nextEvts.length).toEqual(3)

                                                expect(nextEvts.next).toBeInstanceOf(Function)

                                                nextEvts.next(function (err, nextNextEvts) {
                                                    expect(err).not.toBeTruthy()

                                                    expect(nextNextEvts.length).toEqual(3)

                                                    expect(nextNextEvts.next).toBeInstanceOf(
                                                        Function
                                                    )

                                                    done()
                                                })
                                            })
                                        }
                                    )
                                })
                            })
                        })

                        describe('requesting all existing events, without query argument and using next function', () => {
                            debug(
                                'requesting all existing events, without query argument and using next function'
                            )
                            describe('and committing some new events', () => {
                                it('it should work as expected', (done) => {
                                    es.getEvents(0, 3, function (err, evts) {
                                        expect(err).not.toBeTruthy()

                                        expect(evts.length).toEqual(3)

                                        expect(evts.next).toBeInstanceOf(Function)

                                        evts.next(function (err, nextEvts) {
                                            expect(err).not.toBeTruthy()

                                            expect(nextEvts.length).toEqual(3)

                                            expect(nextEvts.next).toBeInstanceOf(Function)

                                            nextEvts.next(function (err, nextNextEvts) {
                                                expect(err).not.toBeTruthy()

                                                expect(nextNextEvts.length).toEqual(3)

                                                expect(nextNextEvts.next).toBeInstanceOf(Function)

                                                done()
                                            })
                                        })
                                    })
                                })
                            })
                        })

                        describe('requesting existing events since a date and using next function', () => {
                            describe('and committing some new events', () => {
                                it('it should work as expected', (done) => {
                                    es.getEventsSince(
                                        new Date(2000, 1, 1),
                                        0,
                                        3,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()

                                            expect(evts.length).toEqual(3)

                                            expect(evts.next).toBeInstanceOf(Function)

                                            evts.next(function (err, nextEvts) {
                                                expect(err).not.toBeTruthy()

                                                expect(nextEvts.length).toEqual(3)

                                                expect(nextEvts.next).toBeInstanceOf(Function)

                                                nextEvts.next(function (err, nextNextEvts) {
                                                    expect(err).not.toBeTruthy()

                                                    expect(nextNextEvts.length).toEqual(3)

                                                    expect(nextNextEvts.next).toBeInstanceOf(
                                                        Function
                                                    )

                                                    done()
                                                })
                                            })
                                        }
                                    )
                                })
                            })
                        })

                        describe('requesting all undispatched events', () => {
                            it('it should return the correct events', (done) => {
                                es.getUndispatchedEvents(function (err, evts) {
                                    expect(err).not.toBeTruthy()
                                    expect(evts.length).toEqual(14)

                                    done()
                                })
                            })
                        })

                        describe('requesting all undispatched events by streamId', () => {
                            it('it should return the correct events', (done) => {
                                es.getUndispatchedEvents('myAggId2', function (err, evts) {
                                    expect(err).not.toBeTruthy()
                                    expect(evts.length).toEqual(11)

                                    done()
                                })
                            })
                        })

                        describe('requesting all undispatched events by query', () => {
                            describe('aggregateId', () => {
                                it('it should return the correct events', (done) => {
                                    es.getUndispatchedEvents(
                                        { aggregateId: 'myAggId' },
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(3)

                                            done()
                                        }
                                    )
                                })
                            })

                            describe('aggregate', () => {
                                it('it should return the correct events', (done) => {
                                    es.getUndispatchedEvents(
                                        { aggregate: 'myAgg' },
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(14)

                                            done()
                                        }
                                    )
                                })
                            })

                            describe('context', () => {
                                it('it should return the correct events', (done) => {
                                    es.getUndispatchedEvents(
                                        { context: 'myCont' },
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(14)

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('setting an event to dispatched', () => {
                            it('it should work correctly', (done) => {
                                es.getUndispatchedEvents(function (err, evts) {
                                    expect(err).not.toBeTruthy()
                                    expect(evts.length).toEqual(14)

                                    es.setEventToDispatched(evts[0], function (err) {
                                        expect(err).not.toBeTruthy()

                                        es.getUndispatchedEvents(function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(13)

                                            done()
                                        })
                                    })
                                })
                            })
                        })

                        describe('creating a snapshot', () => {
                            it('it should callback without error', (done) => {
                                es.getEventStream(
                                    {
                                        aggregateId: 'myAggIdOfSnap',
                                        aggregate: 'myAgg',
                                        context: 'myCont',
                                    },
                                    function (err, stream) {
                                        expect(err).not.toBeTruthy()

                                        expect(stream.lastRevision).toEqual(-1)

                                        stream.addEvents([
                                            { oneSnap: 'event1' },
                                            { twoSnap: 'event2' },
                                            { threeSnap: 'event3' },
                                        ])

                                        expect(stream.streamId).toEqual('myAggIdOfSnap')
                                        expect(stream.uncommittedEvents.length).toEqual(3)
                                        expect(stream.events.length).toEqual(0)
                                        expect(stream.lastRevision).toEqual(-1)

                                        stream.commit(function (err, str) {
                                            expect(err).not.toBeTruthy()
                                            expect(str).toEqual(stream)

                                            expect(str.uncommittedEvents.length).toEqual(0)
                                            expect(str.events.length).toEqual(3)
                                            expect(str.lastRevision).toEqual(2)

                                            expect(str.events[0].commitSequence).toEqual(0)
                                            expect(str.events[1].commitSequence).toEqual(1)
                                            expect(str.events[2].commitSequence).toEqual(2)

                                            expect(str.events[0].restInCommitStream).toEqual(2)
                                            expect(str.events[1].restInCommitStream).toEqual(1)
                                            expect(str.events[2].restInCommitStream).toEqual(0)

                                            expect(str.eventsToDispatch.length).toEqual(3)

                                            es.createSnapshot(
                                                {
                                                    aggregateId: stream.aggregateId,
                                                    aggregate: stream.aggregate,
                                                    context: stream.context,
                                                    revision: stream.lastRevision,
                                                    version: 1,
                                                    data: { my: 'snap' },
                                                },
                                                function (err) {
                                                    expect(err).not.toBeTruthy()

                                                    stream.addEvent({ fourSnap: 'event4' })

                                                    stream.commit(function (err, str) {
                                                        expect(err).not.toBeTruthy()
                                                        expect(str).toEqual(stream)

                                                        expect(
                                                            str.uncommittedEvents.length
                                                        ).toEqual(0)
                                                        expect(str.events.length).toEqual(4)
                                                        expect(str.lastRevision).toEqual(3)

                                                        expect(str.eventsToDispatch.length).toEqual(
                                                            1
                                                        )

                                                        done()
                                                    })
                                                }
                                            )
                                        })
                                    }
                                )
                            })

                            it('it should callback without error with no additional events', (done) => {
                                es.getEventStream(
                                    {
                                        aggregateId: 'myAggIdOfSnap2',
                                        aggregate: 'myAgg',
                                        context: 'myCont',
                                    },
                                    function (err, stream) {
                                        expect(err).not.toBeTruthy()

                                        expect(stream.lastRevision).toEqual(-1)

                                        stream.addEvents([
                                            { oneSnap: 'event1' },
                                            { twoSnap: 'event2' },
                                            { threeSnap: 'event3' },
                                        ])

                                        expect(stream.streamId).toEqual('myAggIdOfSnap2')
                                        expect(stream.uncommittedEvents.length).toEqual(3)
                                        expect(stream.events.length).toEqual(0)
                                        expect(stream.lastRevision).toEqual(-1)

                                        stream.commit(function (err, str) {
                                            expect(err).not.toBeTruthy()
                                            expect(str).toEqual(stream)

                                            expect(str.uncommittedEvents.length).toEqual(0)
                                            expect(str.events.length).toEqual(3)
                                            expect(str.lastRevision).toEqual(2)

                                            expect(str.events[0].commitSequence).toEqual(0)
                                            expect(str.events[1].commitSequence).toEqual(1)
                                            expect(str.events[2].commitSequence).toEqual(2)

                                            expect(str.events[0].restInCommitStream).toEqual(2)
                                            expect(str.events[1].restInCommitStream).toEqual(1)
                                            expect(str.events[2].restInCommitStream).toEqual(0)

                                            expect(str.eventsToDispatch.length).toEqual(3)

                                            es.createSnapshot(
                                                {
                                                    aggregateId: stream.aggregateId,
                                                    aggregate: stream.aggregate,
                                                    context: stream.context,
                                                    revision: stream.lastRevision,
                                                    version: 1,
                                                    data: { my: 'snap' },
                                                },
                                                function (err) {
                                                    expect(err).not.toBeTruthy()
                                                    done()
                                                }
                                            )
                                        })
                                    }
                                )
                            })

                            describe('and call getFromSnapshot', () => {
                                it('it should retrieve it and the missing events', (done) => {
                                    es.getFromSnapshot(
                                        { aggregateId: 'myAggIdOfSnap' },
                                        -1,
                                        function (err, snap, stream) {
                                            expect(err).not.toBeTruthy()

                                            expect(snap.aggregateId).toEqual('myAggIdOfSnap')
                                            expect(snap.revision).toEqual(2)
                                            expect(snap.version).toEqual(1)
                                            expect(snap.data.my).toEqual('snap')

                                            expect(stream.lastRevision).toEqual(3)

                                            done()
                                        }
                                    )
                                })

                                it('it should set the lastRevision of an empty event stream to the snapshot revision', (done) => {
                                    debug(
                                        'it should set the lastRevision of an empty event stream to the snapshot revision'
                                    )
                                    es.getFromSnapshot(
                                        { aggregateId: 'myAggIdOfSnap2' },
                                        -1,
                                        function (err, snap, stream) {
                                            expect(err).not.toBeTruthy()

                                            expect(stream.lastRevision).toEqual(snap.revision)

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        if (streamingApiTypes.indexOf(type) !== -1) {
                            describe('streaming api', () => {
                                describe('streaming existing events', () => {
                                    describe('and committing some new events', () => {
                                        it('it should work as expected', (done) => {
                                            var evts = []
                                            var stream = es.streamEvents(
                                                { aggregate: 'myAgg', context: 'myCont' },
                                                0,
                                                3
                                            )
                                            stream.on('data', function (e) {
                                                evts.push(e)
                                            })
                                            stream.on('end', () => {
                                                expect(evts.length).toEqual(3)
                                                done()
                                            })
                                        })
                                    })
                                })
                                describe('streaming all existing events, without query argument', () => {
                                    describe('and committing some new events', () => {
                                        it('it should work as expected', (done) => {
                                            var evts = []
                                            var stream = es.streamEvents(0, 3)
                                            stream.on('data', function (e) {
                                                evts.push(e)
                                            })
                                            stream.on('end', () => {
                                                expect(evts.length).toEqual(3)
                                                done()
                                            })
                                        })
                                    })
                                })

                                describe('requesting existing events since a date', () => {
                                    describe('and committing some new events', () => {
                                        it('it should work as expected', (done) => {
                                            var evts = []
                                            var stream = es.streamEventsSince(
                                                new Date(2000, 1, 1),
                                                0,
                                                3
                                            )
                                            stream.on('data', function (e) {
                                                evts.push(e)
                                            })
                                            stream.on('end', () => {
                                                expect(evts.length).toEqual(3)
                                                done()
                                            })
                                        })
                                    })
                                })
                                describe('requesting existing events by revision', () => {
                                    describe('and committing some new events', () => {
                                        it('it should work as expected', (done) => {
                                            var evts = []
                                            var stream = es.streamEventsByRevision('myAggId2', 0, 3)
                                            stream.on('data', function (e) {
                                                evts.push(e)
                                            })
                                            stream.on('end', () => {
                                                expect(evts.length).toEqual(3)
                                                done()
                                            })
                                        })
                                    })
                                })
                            })
                        }

                        if (positionTypes.indexOf(type) !== -1) {
                            describe('setting event position option', () => {
                                beforeEach((done) => {
                                    es = eventstore({
                                        ...options,
                                        positionsCollectionName: 'positions',
                                        trackPosition: true,
                                    })
                                    es.defineEventMappings({ position: 'head.position' })
                                    es.init(function () {
                                        es.store.clear(done)
                                    })
                                })

                                afterEach((done) => {
                                    es.store.clear(done)
                                })

                                it('it should save the event with position', (done) => {
                                    es.getEventStream(
                                        'streamIdWithPosition',
                                        function (err, stream) {
                                            expect(err).not.toBeTruthy()
                                            stream.addEvent({ one: 'event' })
                                            stream.addEvent({ one: 'event-other' })

                                            stream.commit(function (err, st) {
                                                expect(err).not.toBeTruthy()

                                                expect(st.events.length).toEqual(2)
                                                expect(st.events[0].position).toEqual(1)
                                                expect(st.events[1].position).toEqual(2)

                                                done()
                                            })
                                        }
                                    )
                                })

                                it('it should map position to payload', (done) => {
                                    es.getEventStream(
                                        'streamIdWithPosition',
                                        function (err, stream) {
                                            expect(err).not.toBeTruthy()
                                            stream.addEvent({ one: 'event' })
                                            stream.addEvent({ one: 'event-other' })

                                            stream.commit(function (err, st) {
                                                expect(err).not.toBeTruthy()

                                                expect(st.events.length).toEqual(2)
                                                expect(st.events[0].payload.head.position).toEqual(
                                                    1
                                                )
                                                expect(st.events[1].payload.head.position).toEqual(
                                                    2
                                                )

                                                done()
                                            })
                                        }
                                    )
                                })
                            })
                        }
                    })
                })
            })
            //            })
        })

        describe('and defining the commitStamp option', () => {
            it('it should save the commitStamp correctly', (done) => {
                var es = eventstore()
                es.defineEventMappings({ commitStamp: 'head.date' })
                es.init(function (err) {
                    expect(err).not.toBeTruthy()

                    es.getEventStream('streamIdWithDate', function (err, stream) {
                        stream.addEvent({ one: 'event' })

                        stream.commit(function (err, st) {
                            expect(err).not.toBeTruthy()

                            expect(st.events.length).toEqual(1)
                            expect(st.events[0].payload.head.date).toEqual(st.events[0].commitStamp)

                            done()
                        })
                    })
                })
            })
        })

        describe('and not defining the commitStamp option', () => {
            it('it should not save the commitStamp', (done) => {
                var es = eventstore({})
                es.init(function (err) {
                    expect(err).not.toBeTruthy()

                    es.getEventStream('streamIdWithoutDate', function (err, stream) {
                        stream.addEvent({ one: 'event' })

                        stream.commit(function (err, st) {
                            expect(err).not.toBeTruthy()

                            expect(st.events.length).toEqual(1)
                            expect(st.events[0].payload.date).not.toBeTruthy()
                            expect(st.events[0].payload.head).not.toBeTruthy()

                            done()
                        })
                    })
                })
            })
        })

        describe('and defining the streamRevision option', () => {
            it('it should save the streamRevision correctly', (done) => {
                var es = eventstore()
                es.defineEventMappings({ streamRevision: 'version' })
                es.init(function (err) {
                    expect(err).not.toBeTruthy()

                    es.getEventStream('streamIdWithDate', function (err, stream) {
                        stream.addEvent({ one: 'event' })

                        stream.commit(function (err, st) {
                            expect(err).not.toBeTruthy()

                            expect(st.events.length).toEqual(1)
                            expect(st.events[0].payload.version).toEqual(
                                st.events[0].streamRevision
                            )

                            done()
                        })
                    })
                })
            })
        })

        describe('and defining a publisher function in a synchronous way', () => {
            it('it should initialize an eventDispatcher', (done) => {
                function publish() {}
                var es = eventstore()
                es.useEventPublisher(publish)
                es.init(function (err) {
                    expect(err).not.toBeTruthy()
                    expect(es.publisher).toBeTruthy()
                    done()
                })
            })

            describe('when committing a new event', () => {
                it('it should publish a new event', (done) => {
                    function publish(evt) {
                        expect(evt.one).toEqual('event')
                        done()
                    }

                    var es = eventstore()
                    es.useEventPublisher(publish)
                    es.init(function (err) {
                        expect(err).not.toBeTruthy()

                        es.getEventStream('streamId', function (err, stream) {
                            stream.addEvent({ one: 'event' })

                            stream.commit(function (err) {
                                expect(err).not.toBeTruthy()
                            })
                        })
                    })
                })
            })
        })

        describe('and defining a publisher function in an asynchronous way', () => {
            it('it should initialize an eventDispatcher', (done) => {
                function publish(evt, callback) {
                    callback()
                }
                var es = eventstore()
                es.useEventPublisher(publish)
                es.init(function (err) {
                    expect(err).not.toBeTruthy()
                    expect(es.publisher).toBeTruthy()
                    done()
                })
            })

            describe('when committing a new event', () => {
                it('it should publish a new event', (done) => {
                    function publish(evt, callback) {
                        expect(evt.one).toEqual('event')
                        callback()
                        done()
                    }

                    var es = eventstore()
                    es.useEventPublisher(publish)
                    es.init(function (err) {
                        expect(err).not.toBeTruthy()

                        es.getEventStream('streamId', function (err, stream) {
                            stream.addEvent({ one: 'event' })

                            stream.commit(function (err) {
                                expect(err).not.toBeTruthy()
                            })
                        })
                    })
                })
            })
        })

        describe('and not defining a publisher function', () => {
            it('it should not initialize an eventDispatcher', (done) => {
                var es = eventstore()
                es.init(function (err) {
                    expect(err).not.toBeTruthy()
                    expect(es.publisher).not.toBeTruthy()
                    done()
                })
            })
        })
    })
})
