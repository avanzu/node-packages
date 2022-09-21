const eventstore = require('..')
const InMemory = require('../lib/databases/inmemory')
const Base = require('../lib/base')
const Eventstore = require('../lib/eventstore')
// const { default: async } = require('async')
const debug = require('debug')('@avanzu/eventstore/tests')

describe('eventstore', () => {
    it('it should be a function', () => {
        debug('it should be a function')

        expect(eventstore).toBeInstanceOf(Function)
    })

    it('it should exposed the Base for the Store implementation', () => {
        debug('it should exposed the Base for the Store implementation')

        expect(eventstore.Store).toEqual(Base)
    })

    describe('calling that function', () => {
        describe('without options', () => {
            it('it should return as expected', () => {
                debug('it should return as expected')

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
                debug('it should throw an error')

                expect(() => eventstore({ type: 'strangeDb' })).toThrowError()
            })
        })

        describe('with options of an own db implementation', () => {
            it('it should return with the an instance of that implementation', () => {
                debug('it should return with the an instance of that implementation')

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

                beforeEach(() => es.init())

                afterEach(() => {
                    es.store.getEvents = orgFunc
                })

                describe('with nice arguments', () => {
                    it('it should pass them correctly', async () => {
                        var given = {
                            query: {
                                aggregateId: 'myAggId',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            },
                            skip: 2,
                            limit: 32,
                        }

                        es.store.getEvents = jest.fn().mockResolvedValue()

                        await es.getEvents(given.query, given.skip, given.limit)
                        expect(es.store.getEvents).toHaveBeenCalledWith(
                            given.query,
                            given.skip,
                            given.limit
                        )
                    })
                })

                describe('with only the callback', () => {
                    it('it should pass them correctly', async () => {
                        es.store.getEvents = jest.fn().mockResolvedValue()

                        await es.getEvents()
                        expect(es.store.getEvents).toHaveBeenCalledWith({}, 0, -1)
                    })
                })

                describe('with query and callback', () => {
                    it('it should pass them correctly', async () => {
                        var given = {
                            query: {
                                aggregateId: 'myAggId',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            },
                            callback: () => {},
                        }

                        es.store.getEvents = jest.fn().mockResolvedValue()

                        await es.getEvents(given.query)
                        expect(es.store.getEvents).toHaveBeenCalledWith(given.query, 0, -1)
                    })
                })

                describe('with skip and callback', () => {
                    it('it should pass them correctly', async () => {
                        var given = {
                            skip: 3,
                            callback: () => {},
                        }

                        es.store.getEvents = jest.fn().mockResolvedValue()

                        await es.getEvents(given.skip)
                        expect(es.store.getEvents).toHaveBeenCalledWith({}, given.skip, -1)
                    })
                })

                describe('with query, skip and callback', () => {
                    it('it should pass them correctly', async () => {
                        var given = {
                            query: {
                                aggregateId: 'myAggId',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            },
                            skip: 3,
                        }

                        es.store.getEvents = jest.fn().mockResolvedValue()

                        await es.getEvents(given.query, given.skip)
                        expect(es.store.getEvents).toHaveBeenCalledWith(given.query, given.skip, -1)
                    })
                })

                describe('with skip, limit and callback', () => {
                    it('it should pass them correctly', async () => {
                        var given = {
                            skip: 3,
                            limit: 50,
                            callback: () => {},
                        }

                        es.store.getEvents = jest.fn().mockResolvedValue()

                        await es.getEvents(given.skip, given.limit)
                        expect(es.store.getEvents).toHaveBeenCalledWith({}, given.skip, given.limit)
                    })
                })

                describe('with query as string,  skip, limit and callback', () => {
                    it('it should pass them correctly', async () => {
                        var given = {
                            query: 'myAggId',
                            skip: 3,
                            limit: 50,
                            callback: () => {},
                        }

                        es.store.getEvents = jest.fn().mockResolvedValue()

                        await es.getEvents(given.query, given.skip, given.limit)
                        expect(es.store.getEvents).toHaveBeenCalledWith(
                            { aggregateId: 'myAggId' },
                            given.skip,
                            given.limit
                        )
                    })
                })
            })

            describe('getEventsByRevision', () => {
                var es = eventstore(),
                    orgFunc = es.store.getEventsByRevision

                beforeEach(() => es.init())

                afterEach(() => {
                    es.store.getEventsByRevision = orgFunc
                })

                describe('with nice arguments', () => {
                    it('it should pass them correctly', async () => {
                        var given = {
                            query: {
                                aggregateId: 'myAggId',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            },
                            revMin: 2,
                            revMax: 32,
                        }

                        es.store.getEventsByRevision = jest.fn().mockResolvedValue()

                        await es.getEventsByRevision(given.query, given.revMin, given.revMax)
                        expect(es.store.getEventsByRevision).toHaveBeenCalledWith(
                            given.query,
                            given.revMin,
                            given.revMax
                        )
                    })
                })

                describe('with query and callback', () => {
                    it('it should pass them correctly', async () => {
                        var given = {
                            query: {
                                aggregateId: 'myAggId',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            },
                        }

                        es.store.getEventsByRevision = jest.fn().mockResolvedValue()

                        await es.getEventsByRevision(given.query)
                        expect(es.store.getEventsByRevision).toHaveBeenCalledWith(
                            given.query,
                            0,
                            -1
                        )
                    })
                })

                describe('with query, revMin and callback', () => {
                    it('it should pass them correctly', async () => {
                        var given = {
                            query: {
                                aggregateId: 'myAggId',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            },
                            revMin: 2,
                        }

                        es.store.getEventsByRevision = jest.fn().mockResolvedValue()

                        await es.getEventsByRevision(given.query, given.revMin)
                        expect(es.store.getEventsByRevision).toHaveBeenCalledWith(
                            given.query,
                            given.revMin,
                            -1
                        )
                    })
                })

                describe('with query as string, revMin, revMax and callback', () => {
                    it('it should pass them correctly', async () => {
                        var given = {
                            query: 'myAggId',
                            revMin: 2,
                            revMax: 4,
                        }

                        es.store.getEventsByRevision = jest.fn().mockResolvedValue()

                        await es.getEventsByRevision(given.query, given.revMin, given.revMax)
                        expect(es.store.getEventsByRevision).toHaveBeenCalledWith(
                            { aggregateId: 'myAggId' },
                            given.revMin,
                            given.revMax
                        )
                    })
                })

                describe('with wrong query', () => {
                    it('it should pass them correctly', async () => {
                        await expect(es.getEventsByRevision(123, 3, 100)).rejects.toBeInstanceOf(
                            Error
                        )
                    })
                })
            })

            describe('getEventStream', () => {
                var es = eventstore(),
                    orgFunc = es.store.getEventsByRevision

                beforeEach(() => es.init())

                afterEach(() => {
                    es.store.getEventsByRevision = orgFunc
                })

                describe('with nice arguments', () => {
                    it('it should pass them correctly', async () => {
                        var given = {
                            query: {
                                aggregateId: 'myAggId',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            },
                            revMin: 2,
                            revMax: 32,
                        }

                        es.store.getEventsByRevision = jest.fn().mockResolvedValue()

                        await es.getEventStream(given.query, given.revMin, given.revMax)
                        expect(es.store.getEventsByRevision).toHaveBeenCalledWith(
                            given.query,
                            given.revMin,
                            given.revMax
                        )
                    })
                })

                describe('with query and callback', () => {
                    it('it should pass them correctly', async () => {
                        var given = {
                            query: {
                                aggregateId: 'myAggId',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            },
                        }

                        es.store.getEventsByRevision = jest.fn().mockResolvedValue()

                        await es.getEventStream(given.query)
                        expect(es.store.getEventsByRevision).toHaveBeenCalledWith(
                            given.query,
                            0,
                            -1
                        )
                    })
                })

                describe('with query, revMin and callback', () => {
                    it('it should pass them correctly', async () => {
                        var given = {
                            query: {
                                aggregateId: 'myAggId',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            },
                            revMin: 2,
                        }

                        es.store.getEventsByRevision = jest.fn().mockResolvedValue()

                        await es.getEventStream(given.query, given.revMin)
                        expect(es.store.getEventsByRevision).toHaveBeenCalledWith(
                            given.query,
                            given.revMin,
                            -1
                        )
                    })
                })

                describe('with query as string, revMin, revMax and callback', () => {
                    it('it should pass them correctly', async () => {
                        var given = {
                            query: 'myAggId',
                            revMin: 2,
                            revMax: 4,
                        }

                        es.store.getEventsByRevision = jest.fn().mockResolvedValue()

                        await es.getEventStream(given.query, given.revMin, given.revMax)
                        expect(es.store.getEventsByRevision).toHaveBeenCalledWith(
                            { aggregateId: 'myAggId' },
                            given.revMin,
                            given.revMax
                        )
                    })
                })

                describe('with wrong query', () => {
                    it('it should pass them correctly', async () => {
                        await expect(es.getEventStream(123, 3, 100)).rejects.toBeInstanceOf(Error)
                    })
                })
            })

            describe('getFromSnapshot', () => {
                var es = eventstore(),
                    orgFunc = es.store.getSnapshot

                beforeEach(() => es.init())

                afterEach(() => {
                    es.store.getSnapshot = orgFunc
                })

                describe('with nice arguments', () => {
                    it('it should pass them correctly', async () => {
                        var given = {
                            query: {
                                aggregateId: 'myAggId',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            },
                            revMax: 32,
                        }

                        es.store.getSnapshot = jest.fn().mockResolvedValue()

                        await es.getFromSnapshot(given.query, given.revMax)
                        expect(es.store.getSnapshot).toHaveBeenCalledWith(given.query, given.revMax)
                    })
                })

                describe('with query and callback', () => {
                    it('it should pass them correctly', async () => {
                        var given = {
                            query: {
                                aggregateId: 'myAggId',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            },
                        }

                        es.store.getSnapshot = jest.fn().mockResolvedValue()

                        await es.getFromSnapshot(given.query)
                        expect(es.store.getSnapshot).toHaveBeenCalledWith(given.query, -1)
                    })

                    describe('with query as string, revMax and callback', () => {
                        it('it should pass them correctly', async () => {
                            var given = {
                                query: 'myAggId',
                                revMax: 31,
                            }

                            es.store.getSnapshot = jest.fn().mockResolvedValue()

                            await es.getFromSnapshot(given.query, given.revMax)
                            expect(es.store.getSnapshot).toHaveBeenCalledWith(
                                { aggregateId: 'myAggId' },
                                given.revMax
                            )
                        })
                    })

                    describe('with wrong query', () => {
                        it('it should pass them correctly', async () => {
                            await expect(es.getFromSnapshot(123, 100)).rejects.toBeInstanceOf(Error)
                        })
                    })
                })
            })

            describe('createSnapshot', () => {
                var es = eventstore(),
                    orgFunc = es.store.addSnapshot

                beforeEach(() => es.init())

                afterEach(() => {
                    es.store.addSnapshot = orgFunc
                })

                describe('with nice arguments', () => {
                    it('it should pass them correctly', async () => {
                        var obj = {
                            aggregateId: 'myAggId',
                            aggregate: 'myAgg',
                            context: 'myCont',
                            data: { snap: 'data' },
                        }

                        es.store.addSnapshot = jest.fn().mockResolvedValue()

                        await es.createSnapshot(obj, () => {})
                        expect(es.store.addSnapshot).toHaveBeenCalledWith(
                            expect.objectContaining(obj)
                        )
                    })
                })

                describe('with streamId', () => {
                    it('it should pass them correctly', async () => {
                        var obj = {
                            streamId: 'myAggId',
                            data: { snap: 'data' },
                        }

                        es.store.addSnapshot = jest.fn().mockResolvedValue()

                        await es.createSnapshot(obj, () => {})
                        expect(es.store.addSnapshot).toHaveBeenCalledWith(
                            expect.objectContaining(obj)
                        )
                    })
                })

                describe('with wrong aggregateId', () => {
                    it('it should pass them correctly', async () => {
                        var obj = {
                            data: { snap: 'data' },
                        }

                        await expect(es.createSnapshot(obj)).rejects.toBeInstanceOf(Error)
                    })
                })

                describe('with wrong data', () => {
                    it('it should pass them correctly', async () => {
                        var obj = {
                            aggregateId: 'myAggId',
                            aggregate: 'myAgg',
                            context: 'myCont',
                        }

                        await expect(es.createSnapshot(obj)).rejects.toBeInstanceOf(Error)
                    })
                })
            })

            describe('cleanSnapshots', () => {
                var es = eventstore({
                        maxSnapshotsCount: 5,
                    }),
                    orgFunc = es.store.cleanSnapshots,
                    addSnapshot = es.store.addSnapshot

                beforeEach(() => {
                    es.store.addSnapshot = (snap, callback = () => {}) =>
                        new Promise((Ok) => (callback(), Ok()))
                    return es.init()
                })

                afterEach(() => {
                    es.store.cleanSnapshots = orgFunc
                    es.store.addSnapshot = addSnapshot
                })

                describe('with streamId', () => {
                    it('it should pass them correctly', async () => {
                        var obj = {
                            streamId: 'myAggId',
                            aggregate: 'myAgg',
                            context: 'myCont',
                            data: { snap: 'data' },
                        }

                        es.store.cleanSnapshots = jest.fn().mockResolvedValue()

                        await es.createSnapshot(obj)
                        expect(es.store.cleanSnapshots).toHaveBeenCalledWith({
                            aggregateId: obj.streamId,
                            aggregate: obj.aggregate,
                            context: obj.context,
                        })
                    })
                })

                describe('with options not activated', () => {
                    beforeEach(() => {
                        es.options.maxSnapshotsCount = 0
                    })

                    it('it should not clean snapshots', async () => {
                        var obj = {
                            streamId: 'myAggId',
                            aggregate: 'myAgg',
                            context: 'myCont',
                            data: { snap: 'data' },
                        }

                        es.store.cleanSnapshots = jest.fn().mockResolvedValue()

                        await es.createSnapshot(obj)
                        expect(es.store.cleanSnapshots).not.toHaveBeenCalled()
                    })
                })
            })

            describe('setEventToDispatched', () => {
                var es = eventstore(),
                    orgFunc = es.store.setEventToDispatched

                beforeEach(() => es.init())

                afterEach(() => {
                    es.store.setEventToDispatched = orgFunc
                })

                describe('with an event', () => {
                    it('it should pass it correctly', async () => {
                        var evt = {
                            id: '1234',
                        }

                        es.store.setEventToDispatched = jest.fn().mockResolvedValue()

                        await es.setEventToDispatched(evt, () => {})
                        expect(es.store.setEventToDispatched).toHaveBeenCalledWith(evt.id)
                    })
                })

                describe('with a commitId', () => {
                    it('it should pass it correctly', async () => {
                        var evt = {
                            commitId: '1234',
                        }

                        es.store.setEventToDispatched = jest.fn().mockResolvedValue()

                        await es.setEventToDispatched(evt.commitId, () => {})
                        expect(es.store.setEventToDispatched).toHaveBeenCalledWith(evt.commitId)
                    })
                })
            })
        })

        var types = [
            [
                'mongodb',
                {
                    type: 'mongodb',
                    host: process.env.__MONGO_HOST__,
                    port: process.env.__MONGO_PORT__,
                },
            ],
            // ['inmemory', { type: 'inmemory' }],
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
        const idle = (time) => new Promise((Ok) => setTimeout(Ok, time))

        //            types.forEach(function (type) {
        describe.each(types)('Type %s', (type, options) => {
            debug('Implementation of ', type)
            var es = null

            beforeAll(() => debug(type, options))

            describe('calling init without callback', () => {
                afterEach(async () => {
                    await es.store.disconnect()
                    await idle(100)
                })

                beforeEach(() => {
                    es = eventstore(options)
                })

                it('it should emit connect', async () => {
                    debug('it should emit connect')

                    const connect = jest.fn()
                    es.once('connect', connect)
                    await es.init()
                    expect(connect).toHaveBeenCalled()
                })
            })

            describe('having initialized (connected)', () => {
                describe('calling disconnect on store', () => {
                    beforeEach(async () => {
                        es = eventstore(options)
                        await es.init()
                    })

                    it('it should callback successfully', async () => {
                        debug('it should callback successfully')

                        const disconnect = jest.fn()
                        es.once('disconnect', disconnect)
                        await es.store.disconnect()

                        expect(disconnect).toHaveBeenCalled()
                    })
                })

                describe('using the eventstore', () => {
                    beforeAll(async () => {
                        es = eventstore(options)
                        await es.init()
                        await es.store.clear()
                    })

                    afterAll(async () => await es.store.clear())

                    describe('calling getNewId', () => {
                        it('it should callback with a new Id as string', async () => {
                            debug('it should callback with a new Id as string')

                            const id = await es.getNewId()
                            expect(id).toMatch(/.+/)
                        })
                    })

                    describe('requesting a new eventstream', () => {
                        describe('and committing some new events', () => {
                            it('it should work as expected', async () => {
                                debug('it should work as expected')

                                const stream = await es.getEventStream({
                                    aggregateId: 'myAggId',
                                    aggregate: 'myAgg',
                                    context: 'myCont',
                                })
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

                                const str = await stream.commit()
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
                            })
                        })
                    })

                    describe('requesting an existing eventstream', () => {
                        describe('and committing some new events', () => {
                            beforeEach(async () => {
                                const stream = await es.getEventStream({
                                    aggregateId: 'myAggId2',
                                    aggregate: 'myAgg',
                                    context: 'myCont',
                                })

                                stream.addEvents([
                                    { one: 'event1' },
                                    { two: 'event2' },
                                    { three: 'event3' },
                                ])

                                await stream.commit()
                            })

                            it('it should work as expected', async () => {
                                debug('it should work as expected')

                                const stream = await es.getEventStream({
                                    aggregateId: 'myAggId2',
                                    aggregate: 'myAgg',
                                    context: 'myCont',
                                })
                                expect(stream.lastRevision).toEqual(2)

                                await stream.addEvents([{ for: 'event4' }, { five: 'event5' }])

                                expect(stream.streamId).toEqual('myAggId2')
                                expect(stream.uncommittedEvents.length).toEqual(2)
                                expect(stream.events.length).toEqual(3)
                                expect(stream.lastRevision).toEqual(2)

                                const str = await stream.commit()
                                expect(str).toEqual(stream)

                                expect(str.uncommittedEvents.length).toEqual(0)
                                expect(str.events.length).toEqual(5)
                                expect(str.lastRevision).toEqual(4)

                                expect(str.events[3].commitSequence).toEqual(0)
                                expect(str.events[4].commitSequence).toEqual(1)

                                expect(str.events[3].restInCommitStream).toEqual(1)
                                expect(str.events[4].restInCommitStream).toEqual(0)

                                expect(str.eventsToDispatch.length).toEqual(2)
                            })

                            it('it should be able to retrieve them', async () => {
                                debug('it should be able to retrieve them')

                                const evts = await es.getEvents({
                                    aggregateId: 'myAggId2',
                                    aggregate: 'myAgg',
                                    context: 'myCont',
                                })
                                expect(evts.length).toEqual(8)
                            })

                            it('it should be able to retrieve by context', async () => {
                                debug('it should be able to retrieve by context')

                                const evts = await es.getEvents({ context: 'myCont' })
                                expect(evts.length).toEqual(14)
                            })
                        })
                    })

                    describe('requesting existing events and using next function', () => {
                        describe('and committing some new events', () => {
                            it('it should work as expected', async () => {
                                debug('it should work as expected')

                                const evts = await es.getEvents(
                                    { aggregate: 'myAgg', context: 'myCont' },
                                    0,
                                    3
                                )
                                expect(evts.length).toEqual(3)

                                expect(evts.next).toBeInstanceOf(Function)

                                const nextEvts = await evts.next()
                                expect(nextEvts.length).toEqual(3)

                                expect(nextEvts.next).toBeInstanceOf(Function)

                                const nextNextEvts = await nextEvts.next()
                                expect(nextNextEvts.length).toEqual(3)

                                expect(nextNextEvts.next).toBeInstanceOf(Function)
                            })
                        })
                    })

                    describe('requesting all existing events, without query argument and using next function', () => {
                        debug(
                            'requesting all existing events, without query argument and using next function'
                        )
                        describe('and committing some new events', () => {
                            it('it should work as expected', async () => {
                                debug('it should work as expected')

                                const evts = await es.getEvents(0, 3)
                                expect(evts.length).toEqual(3)

                                expect(evts.next).toBeInstanceOf(Function)

                                const nextEvts = await evts.next()
                                expect(nextEvts.length).toEqual(3)

                                expect(nextEvts.next).toBeInstanceOf(Function)

                                const nextNextEvts = await nextEvts.next()
                                expect(nextNextEvts.length).toEqual(3)

                                expect(nextNextEvts.next).toBeInstanceOf(Function)
                            })
                        })
                    })

                    describe('requesting existing events since a date and using next function', () => {
                        describe('and committing some new events', () => {
                            it('it should work as expected', async () => {
                                debug('it should work as expected')

                                const evts = await es.getEventsSince(new Date(2000, 1, 1), 0, 3)
                                expect(evts.length).toEqual(3)

                                expect(evts.next).toBeInstanceOf(Function)

                                const nextEvts = await evts.next()
                                expect(nextEvts.length).toEqual(3)

                                expect(nextEvts.next).toBeInstanceOf(Function)

                                const nextNextEvts = await nextEvts.next()
                                expect(nextNextEvts.length).toEqual(3)

                                expect(nextNextEvts.next).toBeInstanceOf(Function)
                            })
                        })
                    })

                    describe('requesting all undispatched events', () => {
                        it('it should return the correct events', async () => {
                            debug('it should return the correct events')

                            const evts = await es.getUndispatchedEvents()
                            expect(evts.length).toEqual(14)
                        })
                    })

                    describe('requesting all undispatched events by streamId', () => {
                        it('it should return the correct events', async () => {
                            debug('it should return the correct events')

                            const evts = await es.getUndispatchedEvents('myAggId2')
                            expect(evts.length).toEqual(11)
                        })
                    })

                    describe('requesting all undispatched events by query', () => {
                        describe('aggregateId', () => {
                            it('it should return the correct events', async () => {
                                debug('it should return the correct events')

                                const evts = await es.getUndispatchedEvents({
                                    aggregateId: 'myAggId',
                                })
                                expect(evts.length).toEqual(3)
                            })
                        })

                        describe('aggregate', () => {
                            it('it should return the correct events', async () => {
                                debug('it should return the correct events')

                                const evts = await es.getUndispatchedEvents({
                                    aggregate: 'myAgg',
                                })
                                expect(evts.length).toEqual(14)
                            })
                        })

                        describe('context', () => {
                            it('it should return the correct events', async () => {
                                debug('it should return the correct events')

                                const evts = await es.getUndispatchedEvents({
                                    context: 'myCont',
                                })
                                expect(evts.length).toEqual(14)
                            })
                        })
                    })

                    describe('setting an event to dispatched', () => {
                        it('it should work correctly', async () => {
                            debug('it should work correctly')

                            const evts = await es.getUndispatchedEvents()
                            expect(evts.length).toEqual(14)

                            await es.setEventToDispatched(evts[0])
                            const nextEvts = await es.getUndispatchedEvents()
                            expect(nextEvts.length).toEqual(13)
                        })
                    })

                    describe('creating a snapshot', () => {
                        it('it should callback without error', async () => {
                            debug('it should callback without error')

                            const stream = await es.getEventStream({
                                aggregateId: 'myAggIdOfSnap',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            })

                            expect(stream.lastRevision).toEqual(-1)

                            await stream.addEvents([
                                { oneSnap: 'event1' },
                                { twoSnap: 'event2' },
                                { threeSnap: 'event3' },
                            ])

                            expect(stream.streamId).toEqual('myAggIdOfSnap')
                            expect(stream.uncommittedEvents.length).toEqual(3)
                            expect(stream.events.length).toEqual(0)
                            expect(stream.lastRevision).toEqual(-1)

                            const str = await stream.commit()
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

                            await es.createSnapshot({
                                aggregateId: stream.aggregateId,
                                aggregate: stream.aggregate,
                                context: stream.context,
                                revision: stream.lastRevision,
                                version: 1,
                                data: { my: 'snap' },
                            })
                            stream.addEvent({ fourSnap: 'event4' })

                            const nextStr = await stream.commit()
                            expect(nextStr).toEqual(stream)
                            expect(nextStr.uncommittedEvents.length).toEqual(0)
                            expect(nextStr.events.length).toEqual(4)
                            expect(nextStr.lastRevision).toEqual(3)
                            expect(nextStr.eventsToDispatch.length).toEqual(1)
                        })

                        it('it should callback without error with no additional events', async () => {
                            debug('it should callback without error with no additional events')

                            const stream = await es.getEventStream({
                                aggregateId: 'myAggIdOfSnap2',
                                aggregate: 'myAgg',
                                context: 'myCont',
                            })
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

                            const str = await stream.commit()
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

                            await es.createSnapshot({
                                aggregateId: stream.aggregateId,
                                aggregate: stream.aggregate,
                                context: stream.context,
                                revision: stream.lastRevision,
                                version: 1,
                                data: { my: 'snap' },
                            })
                        })

                        describe('and call getFromSnapshot', () => {
                            it('it should retrieve it and the missing events', async () => {
                                debug('it should retrieve it and the missing events')

                                const [snap, stream] = await es.getFromSnapshot(
                                    { aggregateId: 'myAggIdOfSnap' },
                                    -1
                                )
                                expect(snap.aggregateId).toEqual('myAggIdOfSnap')
                                expect(snap.revision).toEqual(2)
                                expect(snap.version).toEqual(1)
                                expect(snap.data.my).toEqual('snap')

                                expect(stream.lastRevision).toEqual(3)
                            })

                            it('it should set the lastRevision of an empty event stream to the snapshot revision', async () => {
                                debug(
                                    'it should set the lastRevision of an empty event stream to the snapshot revision'
                                )
                                const [snap, stream] = await es.getFromSnapshot(
                                    { aggregateId: 'myAggIdOfSnap2' },
                                    -1
                                )
                                expect(stream.lastRevision).toEqual(snap.revision)
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
                            beforeEach(async () => {
                                es = eventstore({
                                    ...options,
                                    positionsCollectionName: 'positions',
                                    trackPosition: true,
                                })
                                es.defineEventMappings({ position: 'head.position' })
                                await es.init()
                                await es.store.clear()
                            })

                            afterEach(() => es.store.clear())

                            it('it should save the event with position', async () => {
                                debug('it should save the event with position')

                                const stream = await es.getEventStream('streamIdWithPosition')
                                stream.addEvent({ one: 'event' })
                                stream.addEvent({ one: 'event-other' })

                                const st = await stream.commit()
                                expect(st.events.length).toEqual(2)
                                expect(st.events[0].position).toEqual(1)
                                expect(st.events[1].position).toEqual(2)
                            })

                            it('it should map position to payload', async () => {
                                debug('it should map position to payload')

                                const stream = await es.getEventStream('streamIdWithPosition')

                                stream.addEvent({ one: 'event' })
                                stream.addEvent({ one: 'event-other' })

                                const st = await stream.commit()
                                expect(st.events.length).toEqual(2)
                                expect(st.events[0].payload.head.position).toEqual(1)
                                expect(st.events[1].payload.head.position).toEqual(2)
                            })
                        })
                    }
                })
            })
        })
        //            })

        describe('and defining the commitStamp option', () => {
            it('it should save the commitStamp correctly', async () => {
                debug('it should save the commitStamp correctly')

                var es = eventstore()
                es.defineEventMappings({ commitStamp: 'head.date' })
                await es.init()
                const stream = await es.getEventStream('streamIdWithDate')
                stream.addEvent({ one: 'event' })

                const st = await stream.commit()
                expect(st.events.length).toEqual(1)
                expect(st.events[0].payload.head.date).toEqual(st.events[0].commitStamp)
            })
        })

        describe('and not defining the commitStamp option', () => {
            it('it should not save the commitStamp', async () => {
                debug('it should not save the commitStamp')

                var es = eventstore({})
                await es.init()
                const stream = await es.getEventStream('streamIdWithoutDate')
                stream.addEvent({ one: 'event' })

                const st = await stream.commit()
                expect(st.events.length).toEqual(1)
                expect(st.events[0].payload.date).not.toBeTruthy()
                expect(st.events[0].payload.head).not.toBeTruthy()
            })
        })

        describe('and defining the streamRevision option', () => {
            it('it should save the streamRevision correctly', async () => {
                debug('it should save the streamRevision correctly')

                var es = eventstore()
                es.defineEventMappings({ streamRevision: 'version' })
                await es.init()
                const stream = await es.getEventStream('streamIdWithDate')
                stream.addEvent({ one: 'event' })

                const st = await stream.commit()
                expect(st.events.length).toEqual(1)
                expect(st.events[0].payload.version).toEqual(st.events[0].streamRevision)
            })
        })

        describe('and defining a publisher function in a synchronous way', () => {
            it('it should initialize an eventDispatcher', async () => {
                debug('it should initialize an eventDispatcher')

                function publish() {}
                var es = eventstore()
                es.useEventPublisher(publish)
                await es.init()
                expect(es.publisher).toBeTruthy()
            })

            describe('when committing a new event', () => {
                it('it should publish a new event', async () => {
                    debug('it should publish a new event')

                    const publish = jest.fn()
                    //function publish(evt) {
                    //    expect(evt.one).toEqual('event')
                    //    done()
                    //}

                    var es = eventstore()
                    es.useEventPublisher(publish)
                    await es.init()
                    const stream = await es.getEventStream('streamId')
                    stream.addEvent({ one: 'event' })

                    await stream.commit()
                    expect(publish).toHaveBeenCalled()
                })
            })
        })

        describe('and defining a publisher function in an asynchronous way', () => {
            it('it should initialize an eventDispatcher', async () => {
                debug('it should initialize an eventDispatcher')

                function publish(evt, callback) {
                    callback()
                }
                var es = eventstore()
                es.useEventPublisher(publish)
                await es.init()
                expect(es.publisher).toBeTruthy()
            })

            describe('when committing a new event', () => {
                it('it should publish a new event', async () => {
                    const publish = jest.fn()
                    // function publish(evt, callback) {
                    //     expect(evt.one).toEqual('event')
                    //     callback()
                    //
                    // }

                    var es = eventstore()
                    es.useEventPublisher(publish)
                    await es.init()
                    const stream = await es.getEventStream('streamId')
                    stream.addEvent({ one: 'event' })

                    await stream.commit()
                    expect(publish).toHaveBeenCalledWith(
                        expect.objectContaining({ one: 'event' }),
                        expect.any(Function)
                    )
                })
            })
        })

        describe('and not defining a publisher function', () => {
            it('it should not initialize an eventDispatcher', async () => {
                debug('it should not initialize an eventDispatcher')

                var es = eventstore()
                await es.init()
                expect(es.publisher).not.toBeTruthy()
            })
        })
    })
})
