const Base = require('../lib/base')
const async = require('async')
const _ = require('lodash')

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

describe.each(types)('"%s" store implementation', (type, options) => {
    var Store = require('../lib/databases/' + type)
    var store

    beforeAll(() => {
        options.maxSnapshotsCount = 5
        store = new Store(options)
    })

    describe('creating an instance', () => {
        it('it should return correct object', () => {
            expect(store).toBeInstanceOf(Base)
            expect(store.connect).toBeInstanceOf(Function)
            expect(store.disconnect).toBeInstanceOf(Function)
            expect(store.getNewId).toBeInstanceOf(Function)
            expect(store.getEvents).toBeInstanceOf(Function)
            expect(store.getEventsSince).toBeInstanceOf(Function)
            expect(store.getEventsByRevision).toBeInstanceOf(Function)
            expect(store.getSnapshot).toBeInstanceOf(Function)
            expect(store.addSnapshot).toBeInstanceOf(Function)
            expect(store.addEvents).toBeInstanceOf(Function)
            expect(store.getUndispatchedEvents).toBeInstanceOf(Function)
            expect(store.setEventToDispatched).toBeInstanceOf(Function)
            expect(store.clear).toBeInstanceOf(Function)

            if (type === 'mongodb' || type === 'tingodb') {
                expect(store.getPendingTransactions).toBeInstanceOf(Function)
                expect(store.getLastEvent).toBeInstanceOf(Function)
                expect(store.repairFailedTransaction).toBeInstanceOf(Function)
            }
        })

        describe('calling connect', () => {
            afterAll(function (done) {
                store.disconnect(done)
            })

            it('it should callback successfully', function (done) {
                store.connect(function (err) {
                    expect(err).not.toBeTruthy()
                    done()
                })
            })

            it('it should emit connect', function (done) {
                store.once('connect', done)
                store.connect()
            })
        })

        describe('having connected', () => {
            describe('calling disconnect', () => {
                beforeEach(function (done) {
                    store.connect(done)
                })

                it('it should callback successfully', function (done) {
                    store.disconnect(function (err) {
                        expect(err).not.toBeTruthy()
                        done()
                    })
                })

                it('it should emit disconnect', function (done) {
                    store.once('disconnect', done)
                    store.disconnect()
                })
            })

            describe('using the store', () => {
                beforeAll(function (done) {
                    store.connect(done)
                })

                beforeEach(function (done) {
                    store.clear(done)
                })

                afterAll(function (done) {
                    store.disconnect(done)
                })

                describe('calling getNewId', () => {
                    it('it should callback with a new Id as string', function (done) {
                        store.getNewId(function (err, id) {
                            expect(err).not.toBeTruthy()
                            expect(id).toMatch(/.+/)
                            done()
                        })
                    })
                })

                describe('calling addEvents', () => {
                    describe('with one event in the array', () => {
                        it('it should save the event', function (done) {
                            var event = {
                                aggregateId: 'id1',
                                id: '111',
                                streamRevision: 0,
                                commitId: '111',
                                commitStamp: new Date(),
                                commitSequence: 0,
                                payload: {
                                    event: 'bla',
                                },
                                applyMappings: () => {},
                            }

                            store.addEvents([event], function (err) {
                                expect(err).not.toBeTruthy()

                                store.getEvents({}, 0, -1, function (err, evts) {
                                    expect(err).not.toBeTruthy()
                                    expect(evts).toBeInstanceOf(Array)
                                    expect(evts).toHaveLength(1)
                                    expect(evts[0].commitStamp.getTime()).toEqual(
                                        event.commitStamp.getTime()
                                    )
                                    expect(evts[0].aggregateId).toEqual(event.aggregateId)
                                    expect(evts[0].commitId).toEqual(event.commitId)
                                    expect(evts[0].payload.event).toEqual(event.payload.event)

                                    done()
                                })
                            })
                        })
                    })

                    describe('with an array in the payload', () => {
                        it('it should save the event', function (done) {
                            var event = {
                                aggregateId: 'id1',
                                id: '111',
                                streamRevision: 0,
                                commitId: '111',
                                commitStamp: new Date(),
                                commitSequence: 0,
                                payload: {
                                    event: 'bla',
                                    array: [],
                                },
                                applyMappings: () => {},
                            }

                            store.addEvents([event], function (err) {
                                expect(err).not.toBeTruthy()

                                store.getEvents({}, 0, -1, function (err, evts) {
                                    expect(err).not.toBeTruthy()

                                    expect(evts[0].payload.array).toBeInstanceOf(Array)

                                    done()
                                })
                            })
                        })
                    })

                    describe('with multiple events in the array', () => {
                        it('it should save the event', function (done) {
                            var event1 = {
                                aggregateId: 'id2',
                                streamRevision: 0,
                                id: '112',
                                commitId: '987',
                                commitStamp: new Date(Date.now() + 1),
                                commitSequence: 0,
                                restInCommitStream: 1,
                                payload: {
                                    event: 'bla',
                                },
                                applyMappings: () => {},
                            }

                            var event2 = {
                                aggregateId: 'id2',
                                streamRevision: 1,
                                id: '113',
                                commitId: '987',
                                commitStamp: new Date(Date.now() + 1),
                                commitSequence: 1,
                                restInCommitStream: 0,
                                payload: {
                                    event: 'bla2',
                                },
                                applyMappings: () => {},
                            }

                            store.addEvents([event1, event2], function (err) {
                                expect(err).not.toBeTruthy()

                                store.getEvents({}, 0, -1, function (err, evts) {
                                    expect(err).not.toBeTruthy()
                                    expect(evts).toBeInstanceOf(Array)
                                    expect(evts).toHaveLength(2)
                                    expect(evts[0].commitStamp.getTime()).toEqual(
                                        event1.commitStamp.getTime()
                                    )
                                    expect(evts[0].aggregateId).toEqual(event1.aggregateId)
                                    expect(evts[0].commitId).toEqual(event1.commitId)
                                    expect(evts[0].payload.event).toEqual(event1.payload.event)
                                    expect(evts[1].commitStamp.getTime()).toEqual(
                                        event2.commitStamp.getTime()
                                    )
                                    expect(evts[1].aggregateId).toEqual(event2.aggregateId)
                                    expect(evts[1].commitId).toEqual(event2.commitId)
                                    expect(evts[1].payload.event).toEqual(event2.payload.event)
                                    expect(evts[1].streamRevision).toBeGreaterThanOrEqual(0)

                                    store.getLastEvent(
                                        { aggregateId: event2.aggregateId },
                                        function (err, evt) {
                                            expect(err).not.toBeTruthy()

                                            expect(evt.commitStamp.getTime()).toEqual(
                                                event2.commitStamp.getTime()
                                            )
                                            expect(evt.aggregateId).toEqual(event2.aggregateId)
                                            expect(evt.commitId).toEqual(event2.commitId)
                                            expect(evt.payload.event).toEqual(event2.payload.event)
                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        if (type === 'mongodb' || type === 'tingodb') {
                            describe('failing to save all events', () => {
                                it('it should successfully handle the transaction', function (done) {
                                    var event1 = {
                                        aggregateId: 'id2_tx',
                                        streamRevision: 0,
                                        id: '112_tx',
                                        commitId: '987_tx',
                                        commitStamp: new Date(Date.now() + 1),
                                        commitSequence: 0,
                                        restInCommitStream: 1,
                                        payload: {
                                            event: 'bla',
                                        },
                                    }

                                    var event2 = {
                                        aggregateId: 'id2_tx',
                                        streamRevision: 1,
                                        id: '113_tx',
                                        commitId: '987_tx',
                                        commitStamp: new Date(Date.now() + 1),
                                        commitSequence: 1,
                                        restInCommitStream: 0,
                                        payload: {
                                            event: 'bla2',
                                        },
                                    }

                                    store.addEvents([event1, event2], function (err) {
                                        expect(err).not.toBeTruthy()

                                        store.transactions.insert(
                                            {
                                                _id: event1.commitId,
                                                events: [event1, event2],
                                                aggregateId: event1.aggregateId,
                                                aggregate: event1.aggregate,
                                                context: event1.context,
                                            },
                                            function (err) {
                                                expect(err).not.toBeTruthy()

                                                store.events.remove(
                                                    { _id: event2.id },
                                                    function (err) {
                                                        expect(err).not.toBeTruthy()

                                                        store.getPendingTransactions(function (
                                                            err,
                                                            txs
                                                        ) {
                                                            expect(err).not.toBeTruthy()

                                                            expect(txs).toBeInstanceOf(Array)
                                                            expect(txs).toHaveLength(1)

                                                            store.getLastEvent(
                                                                {
                                                                    aggregateId: txs[0].aggregateId,
                                                                },
                                                                function (err, lastEvt) {
                                                                    expect(err).not.toBeTruthy()

                                                                    expect(
                                                                        lastEvt.commitStamp.getTime()
                                                                    ).toEqual(
                                                                        event1.commitStamp.getTime()
                                                                    )
                                                                    expect(
                                                                        lastEvt.aggregateId
                                                                    ).toEqual(event1.aggregateId)
                                                                    expect(
                                                                        lastEvt.commitId
                                                                    ).toEqual(event1.commitId)
                                                                    expect(
                                                                        lastEvt.payload.event
                                                                    ).toEqual(event1.payload.event)

                                                                    store.getEventsByRevision(
                                                                        {
                                                                            aggregateId:
                                                                                event2.aggregateId,
                                                                        },
                                                                        0,
                                                                        -1,
                                                                        function (err, evts) {
                                                                            expect(
                                                                                err
                                                                            ).not.toBeTruthy()
                                                                            expect(
                                                                                evts
                                                                            ).toBeInstanceOf(Array)
                                                                            expect(
                                                                                evts
                                                                            ).toHaveLength(2)
                                                                            expect(
                                                                                evts[0].commitStamp.getTime()
                                                                            ).toEqual(
                                                                                event1.commitStamp.getTime()
                                                                            )
                                                                            expect(
                                                                                evts[0].aggregateId
                                                                            ).toEqual(
                                                                                event1.aggregateId
                                                                            )
                                                                            expect(
                                                                                evts[0].commitId
                                                                            ).toEqual(
                                                                                event1.commitId
                                                                            )
                                                                            expect(
                                                                                evts[0].payload
                                                                                    .event
                                                                            ).toEqual(
                                                                                event1.payload.event
                                                                            )
                                                                            expect(
                                                                                evts[1].commitStamp.getTime()
                                                                            ).toEqual(
                                                                                event2.commitStamp.getTime()
                                                                            )
                                                                            expect(
                                                                                evts[1].aggregateId
                                                                            ).toEqual(
                                                                                event2.aggregateId
                                                                            )
                                                                            expect(
                                                                                evts[1].commitId
                                                                            ).toEqual(
                                                                                event2.commitId
                                                                            )
                                                                            expect(
                                                                                evts[1].payload
                                                                                    .event
                                                                            ).toEqual(
                                                                                event2.payload.event
                                                                            )

                                                                            done()
                                                                        }
                                                                    )
                                                                }
                                                            )
                                                        })
                                                    }
                                                )
                                            }
                                        )
                                    })
                                })

                                describe('having no event saved but only the transaction', () => {
                                    it('it should ignore the transaction', function (done) {
                                        var event1 = {
                                            aggregateId: 'id2_tx5',
                                            streamRevision: 3,
                                            id: '112_tx5',
                                            commitId: '987_tx5',
                                            commitStamp: new Date(Date.now() + 1),
                                            commitSequence: 0,
                                            restInCommitStream: 2,
                                            payload: {
                                                event: 'bla',
                                            },
                                        }

                                        var event2 = {
                                            aggregateId: 'id2_tx5',
                                            streamRevision: 4,
                                            id: '113_tx5',
                                            commitId: '987_tx5',
                                            commitStamp: new Date(Date.now() + 1),
                                            commitSequence: 1,
                                            restInCommitStream: 1,
                                            payload: {
                                                event: 'bla2',
                                            },
                                        }

                                        var event3 = {
                                            aggregateId: 'id2_tx5',
                                            streamRevision: 5,
                                            id: '114_tx5',
                                            commitId: '987_tx5',
                                            commitStamp: new Date(Date.now() + 1),
                                            commitSequence: 2,
                                            restInCommitStream: 0,
                                            payload: {
                                                event: 'bla3',
                                            },
                                        }

                                        store.addEvents([event1, event2, event3], function (err) {
                                            expect(err).not.toBeTruthy()

                                            store.transactions.insert(
                                                {
                                                    _id: event1.commitId,
                                                    events: [event1, event2, event3],
                                                    aggregateId: event1.aggregateId,
                                                    aggregate: event1.aggregate,
                                                    context: event1.context,
                                                },
                                                function (err) {
                                                    expect(err).not.toBeTruthy()

                                                    store.events.remove(
                                                        {
                                                            $or: [
                                                                { _id: event1.id },
                                                                { _id: event2.id },
                                                                { _id: event3.id },
                                                            ],
                                                        },
                                                        function (err) {
                                                            expect(err).not.toBeTruthy()

                                                            store.getLastEvent(
                                                                {
                                                                    aggregateId: event1.aggregateId,
                                                                },
                                                                function (err, lastEvt) {
                                                                    expect(err).not.toBeTruthy()
                                                                    expect(lastEvt).not.toBeTruthy()

                                                                    store.transactions
                                                                        .find({})
                                                                        .toArray(function (
                                                                            err,
                                                                            txs
                                                                        ) {
                                                                            expect(
                                                                                err
                                                                            ).not.toBeTruthy()

                                                                            expect(
                                                                                txs
                                                                            ).toHaveLength(1)
                                                                            expect(
                                                                                txs[0]._id
                                                                            ).toEqual(
                                                                                event1.commitId
                                                                            )

                                                                            store.getEventsByRevision(
                                                                                {
                                                                                    aggregateId:
                                                                                        event1.aggregateId,
                                                                                },
                                                                                0,
                                                                                -1,
                                                                                function (
                                                                                    err,
                                                                                    evts
                                                                                ) {
                                                                                    expect(
                                                                                        err
                                                                                    ).not.toBeTruthy()
                                                                                    expect(
                                                                                        evts
                                                                                    ).toBeInstanceOf(
                                                                                        Array
                                                                                    )
                                                                                    expect(
                                                                                        evts
                                                                                    ).toHaveLength(
                                                                                        0
                                                                                    )

                                                                                    store.transactions
                                                                                        .find({})
                                                                                        .toArray(
                                                                                            function (
                                                                                                err,
                                                                                                txs
                                                                                            ) {
                                                                                                expect(
                                                                                                    err
                                                                                                ).not.toBeTruthy()

                                                                                                expect(
                                                                                                    txs
                                                                                                ).toHaveLength(
                                                                                                    1
                                                                                                )
                                                                                                expect(
                                                                                                    txs[0]
                                                                                                        ._id
                                                                                                ).toEqual(
                                                                                                    event1.commitId
                                                                                                )

                                                                                                store.getPendingTransactions(
                                                                                                    function (
                                                                                                        err,
                                                                                                        txs
                                                                                                    ) {
                                                                                                        expect(
                                                                                                            err
                                                                                                        ).not.toBeTruthy()

                                                                                                        expect(
                                                                                                            txs
                                                                                                        ).toBeInstanceOf(
                                                                                                            Array
                                                                                                        )
                                                                                                        expect(
                                                                                                            txs
                                                                                                        ).toHaveLength(
                                                                                                            0
                                                                                                        )

                                                                                                        store.transactions
                                                                                                            .find(
                                                                                                                {}
                                                                                                            )
                                                                                                            .toArray(
                                                                                                                function (
                                                                                                                    err,
                                                                                                                    txs
                                                                                                                ) {
                                                                                                                    expect(
                                                                                                                        err
                                                                                                                    ).not.toBeTruthy()

                                                                                                                    expect(
                                                                                                                        txs
                                                                                                                    ).toHaveLength(
                                                                                                                        0
                                                                                                                    )

                                                                                                                    done()
                                                                                                                }
                                                                                                            )
                                                                                                    }
                                                                                                )
                                                                                            }
                                                                                        )
                                                                                }
                                                                            )
                                                                        })
                                                                }
                                                            )
                                                        }
                                                    )
                                                }
                                            )
                                        })
                                    })
                                })

                                describe('calling getEventsByRevision with a low maxRev value', () => {
                                    it('it should successfully handle the transaction', function (done) {
                                        var event1 = {
                                            aggregateId: 'id2_tx0',
                                            streamRevision: 3,
                                            id: '112_tx0',
                                            commitId: '987_tx0',
                                            commitStamp: new Date(Date.now() + 1),
                                            commitSequence: 0,
                                            restInCommitStream: 2,
                                            payload: {
                                                event: 'bla',
                                            },
                                        }

                                        var event2 = {
                                            aggregateId: 'id2_tx0',
                                            streamRevision: 4,
                                            id: '113_tx0',
                                            commitId: '987_tx0',
                                            commitStamp: new Date(Date.now() + 1),
                                            commitSequence: 1,
                                            restInCommitStream: 1,
                                            payload: {
                                                event: 'bla2',
                                            },
                                        }

                                        var event3 = {
                                            aggregateId: 'id2_tx0',
                                            streamRevision: 5,
                                            id: '114_tx0',
                                            commitId: '987_tx0',
                                            commitStamp: new Date(Date.now() + 1),
                                            commitSequence: 2,
                                            restInCommitStream: 0,
                                            payload: {
                                                event: 'bla3',
                                            },
                                        }

                                        store.addEvents([event1, event2, event3], function (err) {
                                            expect(err).not.toBeTruthy()

                                            store.transactions.insert(
                                                {
                                                    _id: event1.commitId,
                                                    events: [event1, event2, event3],
                                                    aggregateId: event1.aggregateId,
                                                    aggregate: event1.aggregate,
                                                    context: event1.context,
                                                },
                                                function (err) {
                                                    expect(err).not.toBeTruthy()

                                                    store.events.remove(
                                                        {
                                                            $or: [
                                                                { _id: event2.id },
                                                                { _id: event3.id },
                                                            ],
                                                        },
                                                        function (err) {
                                                            expect(err).not.toBeTruthy()

                                                            store.getPendingTransactions(function (
                                                                err,
                                                                txs
                                                            ) {
                                                                expect(err).not.toBeTruthy()

                                                                expect(txs).toBeInstanceOf(Array)
                                                                expect(txs).toHaveLength(1)

                                                                store.getLastEvent(
                                                                    {
                                                                        aggregateId:
                                                                            txs[0].aggregateId,
                                                                    },
                                                                    function (err, lastEvt) {
                                                                        expect(err).not.toBeTruthy()

                                                                        expect(
                                                                            lastEvt.commitStamp.getTime()
                                                                        ).toEqual(
                                                                            event1.commitStamp.getTime()
                                                                        )
                                                                        expect(
                                                                            lastEvt.aggregateId
                                                                        ).toEqual(
                                                                            event1.aggregateId
                                                                        )
                                                                        expect(
                                                                            lastEvt.commitId
                                                                        ).toEqual(event1.commitId)
                                                                        expect(
                                                                            lastEvt.payload.event
                                                                        ).toEqual(
                                                                            event1.payload.event
                                                                        )

                                                                        store.getEventsByRevision(
                                                                            {
                                                                                aggregateId:
                                                                                    event2.aggregateId,
                                                                            },
                                                                            0,
                                                                            5,
                                                                            function (err, evts) {
                                                                                expect(
                                                                                    err
                                                                                ).not.toBeTruthy()
                                                                                expect(
                                                                                    evts
                                                                                ).toBeInstanceOf(
                                                                                    Array
                                                                                )
                                                                                expect(
                                                                                    evts
                                                                                ).toHaveLength(2)
                                                                                expect(
                                                                                    evts[0].commitStamp.getTime()
                                                                                ).toEqual(
                                                                                    event1.commitStamp.getTime()
                                                                                )
                                                                                expect(
                                                                                    evts[0]
                                                                                        .aggregateId
                                                                                ).toEqual(
                                                                                    event1.aggregateId
                                                                                )
                                                                                expect(
                                                                                    evts[0].commitId
                                                                                ).toEqual(
                                                                                    event1.commitId
                                                                                )
                                                                                expect(
                                                                                    evts[0].payload
                                                                                        .event
                                                                                ).toEqual(
                                                                                    event1.payload
                                                                                        .event
                                                                                )
                                                                                expect(
                                                                                    evts[1].commitStamp.getTime()
                                                                                ).toEqual(
                                                                                    event2.commitStamp.getTime()
                                                                                )
                                                                                expect(
                                                                                    evts[1]
                                                                                        .aggregateId
                                                                                ).toEqual(
                                                                                    event2.aggregateId
                                                                                )
                                                                                expect(
                                                                                    evts[1].commitId
                                                                                ).toEqual(
                                                                                    event2.commitId
                                                                                )
                                                                                expect(
                                                                                    evts[1].payload
                                                                                        .event
                                                                                ).toEqual(
                                                                                    event2.payload
                                                                                        .event
                                                                                )

                                                                                store.getLastEvent(
                                                                                    {
                                                                                        aggregateId:
                                                                                            event2.aggregateId,
                                                                                    },
                                                                                    function (
                                                                                        err,
                                                                                        lastEvt
                                                                                    ) {
                                                                                        expect(
                                                                                            err
                                                                                        ).not.toBeTruthy()

                                                                                        expect(
                                                                                            lastEvt.commitStamp.getTime()
                                                                                        ).toEqual(
                                                                                            event3.commitStamp.getTime()
                                                                                        )
                                                                                        expect(
                                                                                            lastEvt.aggregateId
                                                                                        ).toEqual(
                                                                                            event3.aggregateId
                                                                                        )
                                                                                        expect(
                                                                                            lastEvt.commitId
                                                                                        ).toEqual(
                                                                                            event3.commitId
                                                                                        )
                                                                                        expect(
                                                                                            lastEvt
                                                                                                .payload
                                                                                                .event
                                                                                        ).toEqual(
                                                                                            event3
                                                                                                .payload
                                                                                                .event
                                                                                        )

                                                                                        done()
                                                                                    }
                                                                                )
                                                                            }
                                                                        )
                                                                    }
                                                                )
                                                            })
                                                        }
                                                    )
                                                }
                                            )
                                        })
                                    })
                                })

                                describe('calling getEventsByRevision with a too big maxRev value', () => {
                                    it('it should successfully handle the transaction', function (done) {
                                        var event1 = {
                                            aggregateId: 'id2_tx6',
                                            streamRevision: 3,
                                            id: '112_tx6',
                                            commitId: '987_tx6',
                                            commitStamp: new Date(Date.now() + 1),
                                            commitSequence: 0,
                                            restInCommitStream: 2,
                                            payload: {
                                                event: 'bla',
                                            },
                                        }

                                        var event2 = {
                                            aggregateId: 'id2_tx6',
                                            streamRevision: 4,
                                            id: '113_tx6',
                                            commitId: '987_tx6',
                                            commitStamp: new Date(Date.now() + 1),
                                            commitSequence: 1,
                                            restInCommitStream: 1,
                                            payload: {
                                                event: 'bla2',
                                            },
                                        }

                                        var event3 = {
                                            aggregateId: 'id2_tx6',
                                            streamRevision: 5,
                                            id: '114_tx6',
                                            commitId: '987_tx6',
                                            commitStamp: new Date(Date.now() + 1),
                                            commitSequence: 2,
                                            restInCommitStream: 0,
                                            payload: {
                                                event: 'bla3',
                                            },
                                        }

                                        store.addEvents([event1, event2, event3], function (err) {
                                            expect(err).not.toBeTruthy()

                                            store.transactions.insert(
                                                {
                                                    _id: event1.commitId,
                                                    events: [event1, event2, event3],
                                                    aggregateId: event1.aggregateId,
                                                    aggregate: event1.aggregate,
                                                    context: event1.context,
                                                },
                                                function (err) {
                                                    expect(err).not.toBeTruthy()

                                                    store.events.remove(
                                                        {
                                                            $or: [
                                                                { _id: event2.id },
                                                                { _id: event3.id },
                                                            ],
                                                        },
                                                        function (err) {
                                                            expect(err).not.toBeTruthy()

                                                            store.getPendingTransactions(function (
                                                                err,
                                                                txs
                                                            ) {
                                                                expect(err).not.toBeTruthy()

                                                                expect(txs).toBeInstanceOf(Array)
                                                                expect(txs).toHaveLength(1)

                                                                store.getLastEvent(
                                                                    {
                                                                        aggregateId:
                                                                            txs[0].aggregateId,
                                                                    },
                                                                    function (err, lastEvt) {
                                                                        expect(err).not.toBeTruthy()

                                                                        expect(
                                                                            lastEvt.commitStamp.getTime()
                                                                        ).toEqual(
                                                                            event1.commitStamp.getTime()
                                                                        )
                                                                        expect(
                                                                            lastEvt.aggregateId
                                                                        ).toEqual(
                                                                            event1.aggregateId
                                                                        )
                                                                        expect(
                                                                            lastEvt.commitId
                                                                        ).toEqual(event1.commitId)
                                                                        expect(
                                                                            lastEvt.payload.event
                                                                        ).toEqual(
                                                                            event1.payload.event
                                                                        )

                                                                        store.getEventsByRevision(
                                                                            {
                                                                                aggregateId:
                                                                                    event2.aggregateId,
                                                                            },
                                                                            0,
                                                                            10,
                                                                            function (err, evts) {
                                                                                expect(
                                                                                    err
                                                                                ).not.toBeTruthy()
                                                                                expect(
                                                                                    evts
                                                                                ).toBeInstanceOf(
                                                                                    Array
                                                                                )
                                                                                expect(
                                                                                    evts
                                                                                ).toHaveLength(3)
                                                                                expect(
                                                                                    evts[0].commitStamp.getTime()
                                                                                ).toEqual(
                                                                                    event1.commitStamp.getTime()
                                                                                )
                                                                                expect(
                                                                                    evts[0]
                                                                                        .aggregateId
                                                                                ).toEqual(
                                                                                    event1.aggregateId
                                                                                )
                                                                                expect(
                                                                                    evts[0].commitId
                                                                                ).toEqual(
                                                                                    event1.commitId
                                                                                )
                                                                                expect(
                                                                                    evts[0].payload
                                                                                        .event
                                                                                ).toEqual(
                                                                                    event1.payload
                                                                                        .event
                                                                                )
                                                                                expect(
                                                                                    evts[1].commitStamp.getTime()
                                                                                ).toEqual(
                                                                                    event2.commitStamp.getTime()
                                                                                )
                                                                                expect(
                                                                                    evts[1]
                                                                                        .aggregateId
                                                                                ).toEqual(
                                                                                    event2.aggregateId
                                                                                )
                                                                                expect(
                                                                                    evts[1].commitId
                                                                                ).toEqual(
                                                                                    event2.commitId
                                                                                )
                                                                                expect(
                                                                                    evts[1].payload
                                                                                        .event
                                                                                ).toEqual(
                                                                                    event2.payload
                                                                                        .event
                                                                                )
                                                                                expect(
                                                                                    evts[2].commitStamp.getTime()
                                                                                ).toEqual(
                                                                                    event3.commitStamp.getTime()
                                                                                )
                                                                                expect(
                                                                                    evts[2]
                                                                                        .aggregateId
                                                                                ).toEqual(
                                                                                    event3.aggregateId
                                                                                )
                                                                                expect(
                                                                                    evts[2].commitId
                                                                                ).toEqual(
                                                                                    event3.commitId
                                                                                )
                                                                                expect(
                                                                                    evts[2].payload
                                                                                        .event
                                                                                ).toEqual(
                                                                                    event3.payload
                                                                                        .event
                                                                                )

                                                                                store.getLastEvent(
                                                                                    {
                                                                                        aggregateId:
                                                                                            event3.aggregateId,
                                                                                    },
                                                                                    function (
                                                                                        err,
                                                                                        lastEvt
                                                                                    ) {
                                                                                        expect(
                                                                                            err
                                                                                        ).not.toBeTruthy()

                                                                                        expect(
                                                                                            lastEvt.commitStamp.getTime()
                                                                                        ).toEqual(
                                                                                            event3.commitStamp.getTime()
                                                                                        )
                                                                                        expect(
                                                                                            lastEvt.aggregateId
                                                                                        ).toEqual(
                                                                                            event3.aggregateId
                                                                                        )
                                                                                        expect(
                                                                                            lastEvt.commitId
                                                                                        ).toEqual(
                                                                                            event3.commitId
                                                                                        )
                                                                                        expect(
                                                                                            lastEvt
                                                                                                .payload
                                                                                                .event
                                                                                        ).toEqual(
                                                                                            event3
                                                                                                .payload
                                                                                                .event
                                                                                        )

                                                                                        done()
                                                                                    }
                                                                                )
                                                                            }
                                                                        )
                                                                    }
                                                                )
                                                            })
                                                        }
                                                    )
                                                }
                                            )
                                        })
                                    })
                                })

                                describe('and not calling getEventsByRevision', () => {
                                    it('the transaction can successfully be handled from outside', function (done) {
                                        var event1 = {
                                            aggregateId: 'id2_tx',
                                            streamRevision: 0,
                                            id: '112_tx2',
                                            commitId: '987_tx2',
                                            commitStamp: new Date(Date.now() + 1),
                                            commitSequence: 0,
                                            restInCommitStream: 1,
                                            payload: {
                                                event: 'bla',
                                            },
                                        }

                                        var event2 = {
                                            aggregateId: 'id2_tx',
                                            streamRevision: 1,
                                            id: '113_tx2',
                                            commitId: '987_tx2',
                                            commitStamp: new Date(Date.now() + 1),
                                            commitSequence: 1,
                                            restInCommitStream: 0,
                                            payload: {
                                                event: 'bla2',
                                            },
                                        }

                                        store.addEvents([event1, event2], function (err) {
                                            expect(err).not.toBeTruthy()

                                            store.transactions.insert(
                                                {
                                                    _id: event1.commitId,
                                                    events: [event1, event2],
                                                    aggregateId: event1.aggregateId,
                                                    aggregate: event1.aggregate,
                                                    context: event1.context,
                                                },
                                                function (err) {
                                                    expect(err).not.toBeTruthy()

                                                    store.events.remove(
                                                        { _id: event2.id },
                                                        function (err) {
                                                            expect(err).not.toBeTruthy()

                                                            store.getPendingTransactions(function (
                                                                err,
                                                                txs
                                                            ) {
                                                                expect(err).not.toBeTruthy()

                                                                expect(txs).toBeInstanceOf(Array)
                                                                expect(txs).toHaveLength(1)

                                                                store.getLastEvent(
                                                                    {
                                                                        aggregateId:
                                                                            txs[0].aggregateId,
                                                                    },
                                                                    function (err, lastEvt) {
                                                                        expect(err).not.toBeTruthy()

                                                                        expect(
                                                                            lastEvt.commitStamp.getTime()
                                                                        ).toEqual(
                                                                            event1.commitStamp.getTime()
                                                                        )
                                                                        expect(
                                                                            lastEvt.aggregateId
                                                                        ).toEqual(
                                                                            event1.aggregateId
                                                                        )
                                                                        expect(
                                                                            lastEvt.commitId
                                                                        ).toEqual(event1.commitId)
                                                                        expect(
                                                                            lastEvt.payload.event
                                                                        ).toEqual(
                                                                            event1.payload.event
                                                                        )

                                                                        store.repairFailedTransaction(
                                                                            lastEvt,
                                                                            function (err) {
                                                                                expect(
                                                                                    err
                                                                                ).not.toBeTruthy()

                                                                                store.getEvents(
                                                                                    {},
                                                                                    0,
                                                                                    -1,
                                                                                    function (
                                                                                        err,
                                                                                        evts
                                                                                    ) {
                                                                                        expect(
                                                                                            err
                                                                                        ).not.toBeTruthy()
                                                                                        expect(
                                                                                            evts
                                                                                        ).toBeInstanceOf(
                                                                                            Array
                                                                                        )
                                                                                        expect(
                                                                                            evts
                                                                                        ).toHaveLength(
                                                                                            2
                                                                                        )
                                                                                        expect(
                                                                                            evts[0].commitStamp.getTime()
                                                                                        ).toEqual(
                                                                                            event1.commitStamp.getTime()
                                                                                        )
                                                                                        expect(
                                                                                            evts[0]
                                                                                                .aggregateId
                                                                                        ).toEqual(
                                                                                            event1.aggregateId
                                                                                        )
                                                                                        expect(
                                                                                            evts[0]
                                                                                                .commitId
                                                                                        ).toEqual(
                                                                                            event1.commitId
                                                                                        )
                                                                                        expect(
                                                                                            evts[0]
                                                                                                .payload
                                                                                                .event
                                                                                        ).toEqual(
                                                                                            event1
                                                                                                .payload
                                                                                                .event
                                                                                        )
                                                                                        expect(
                                                                                            evts[1].commitStamp.getTime()
                                                                                        ).toEqual(
                                                                                            event2.commitStamp.getTime()
                                                                                        )
                                                                                        expect(
                                                                                            evts[1]
                                                                                                .aggregateId
                                                                                        ).toEqual(
                                                                                            event2.aggregateId
                                                                                        )
                                                                                        expect(
                                                                                            evts[1]
                                                                                                .commitId
                                                                                        ).toEqual(
                                                                                            event2.commitId
                                                                                        )
                                                                                        expect(
                                                                                            evts[1]
                                                                                                .payload
                                                                                                .event
                                                                                        ).toEqual(
                                                                                            event2
                                                                                                .payload
                                                                                                .event
                                                                                        )

                                                                                        done()
                                                                                    }
                                                                                )
                                                                            }
                                                                        )
                                                                    }
                                                                )
                                                            })
                                                        }
                                                    )
                                                }
                                            )
                                        })
                                    })
                                })
                            })
                        }
                    })

                    describe('without aggregateId', () => {
                        it('it should callback with an error', function (done) {
                            var event = {
                                //aggregateId: 'id1',
                                streamRevision: 0,
                                commitId: '114',
                                commitStamp: new Date(),
                                commitSequence: 0,
                                payload: {
                                    event: 'bla',
                                },
                                applyMappings: () => {},
                            }

                            store.addEvents([event], function (err) {
                                expect(err).toBeTruthy()
                                done()
                            })
                        })
                    })

                    describe('only with aggregateId', () => {
                        it('it should save the event', function (done) {
                            var event = {
                                aggregateId: 'idhaha',
                                streamRevision: 0,
                                id: '115',
                                commitId: '115',
                                commitStamp: new Date(),
                                commitSequence: 0,
                                payload: {
                                    event: 'blaffff',
                                },
                                applyMappings: () => {},
                            }

                            store.addEvents([event], function (err) {
                                expect(err).not.toBeTruthy()

                                store.getEvents({}, 0, -1, function (err, evts) {
                                    expect(err).not.toBeTruthy()
                                    expect(evts).toBeInstanceOf(Array)
                                    expect(evts).toHaveLength(1)
                                    expect(evts[0].commitStamp.getTime()).toEqual(
                                        event.commitStamp.getTime()
                                    )
                                    expect(evts[0].aggregateId).toEqual(event.aggregateId)
                                    expect(evts[0].commitId).toEqual(event.commitId)
                                    expect(evts[0].payload.event).toEqual(event.payload.event)

                                    done()
                                })
                            })
                        })
                    })

                    describe('with aggregateId and aggregate', () => {
                        it('it should save the event correctly', function (done) {
                            var event = {
                                aggregateId: 'aggId',
                                aggregate: 'myAgg',
                                streamRevision: 0,
                                id: '116',
                                commitId: '116',
                                commitStamp: new Date(),
                                commitSequence: 0,
                                payload: {
                                    event: 'blaffff',
                                },
                                applyMappings: () => {},
                            }

                            store.addEvents([event], function (err) {
                                expect(err).not.toBeTruthy()

                                store.getEvents({}, 0, -1, function (err, evts) {
                                    expect(err).not.toBeTruthy()
                                    expect(evts).toBeInstanceOf(Array)
                                    expect(evts).toHaveLength(1)
                                    expect(evts[0].commitStamp.getTime()).toEqual(
                                        event.commitStamp.getTime()
                                    )
                                    expect(evts[0].aggregateId).toEqual(event.aggregateId)
                                    expect(evts[0].aggregate).toEqual(event.aggregate)
                                    expect(evts[0].commitId).toEqual(event.commitId)
                                    expect(evts[0].payload.event).toEqual(event.payload.event)

                                    done()
                                })
                            })
                        })
                    })

                    describe('with aggregateId and aggregate and context', () => {
                        it('it should save the event correctly', function (done) {
                            var event = {
                                aggregateId: 'aggId',
                                aggregate: 'myAgg',
                                context: 'myContext',
                                streamRevision: 0,
                                id: '117',
                                commitId: '117',
                                commitStamp: new Date(),
                                commitSequence: 0,
                                payload: {
                                    event: 'blaffff',
                                },
                                applyMappings: () => {},
                            }

                            store.addEvents([event], function (err) {
                                expect(err).not.toBeTruthy()

                                store.getEvents({}, 0, -1, function (err, evts) {
                                    expect(err).not.toBeTruthy()
                                    expect(evts).toBeInstanceOf(Array)
                                    expect(evts).toHaveLength(1)
                                    expect(evts[0].commitStamp.getTime()).toEqual(
                                        event.commitStamp.getTime()
                                    )
                                    expect(evts[0].aggregateId).toEqual(event.aggregateId)
                                    expect(evts[0].aggregate).toEqual(event.aggregate)
                                    expect(evts[0].context).toEqual(event.context)
                                    expect(evts[0].commitId).toEqual(event.commitId)
                                    expect(evts[0].payload.event).toEqual(event.payload.event)

                                    done()
                                })
                            })
                        })
                    })

                    describe('with aggregateId and context', () => {
                        it('it should save the event correctly', function (done) {
                            var event = {
                                aggregateId: 'aggId',
                                context: 'myContext',
                                streamRevision: 0,
                                id: '118',
                                commitStamp: new Date(),
                                commitSequence: 0,
                                commitId: '118',
                                payload: {
                                    event: 'blaffff',
                                },
                                applyMappings: () => {},
                            }

                            store.addEvents([event], function (err) {
                                expect(err).not.toBeTruthy()

                                store.getEvents({}, 0, -1, function (err, evts) {
                                    expect(err).not.toBeTruthy()
                                    expect(evts).toBeInstanceOf(Array)
                                    expect(evts).toHaveLength(1)
                                    expect(evts[0].commitStamp.getTime()).toEqual(
                                        event.commitStamp.getTime()
                                    )
                                    expect(evts[0].aggregateId).toEqual(event.aggregateId)
                                    expect(evts[0].context).toEqual(event.context)
                                    expect(evts[0].commitId).toEqual(event.commitId)
                                    expect(evts[0].payload.event).toEqual(event.payload.event)

                                    done()
                                })
                            })
                        })
                    })
                })

                describe('having some events in the eventstore', () => {
                    var dateSince = new Date(Date.now() + 50)

                    var stream1 = [
                        {
                            aggregateId: 'id',
                            streamRevision: 0,
                            id: '119',
                            commitId: '1119',
                            commitStamp: new Date(Date.now() + 10),
                            commitSequence: 0,
                            payload: {
                                event: 'bla',
                            },
                            applyMappings: () => {},
                        },
                        {
                            aggregateId: 'id',
                            streamRevision: 1,
                            id: '120',
                            commitId: '1119',
                            commitStamp: new Date(Date.now() + 10),
                            commitSequence: 1,
                            payload: {
                                event: 'bla2',
                            },
                            applyMappings: () => {},
                        },
                    ]

                    var stream2 = [
                        {
                            aggregateId: 'idWithAgg',
                            aggregate: 'myAgg',
                            streamRevision: 0,
                            id: '121',
                            commitId: '1121',
                            commitStamp: new Date(Date.now() + 30),
                            commitSequence: 0,
                            payload: {
                                event: 'bla',
                            },
                            applyMappings: () => {},
                        },
                        {
                            aggregateId: 'idWithAgg',
                            aggregate: 'myAgg',
                            streamRevision: 1,
                            id: '122',
                            commitId: '1121',
                            commitStamp: new Date(Date.now() + 30),
                            commitSequence: 1,
                            payload: {
                                event: 'bla2',
                            },
                            applyMappings: () => {},
                        },
                    ]

                    var stream3 = [
                        {
                            aggregateId: 'id', // id already existing...
                            aggregate: 'myAgg',
                            streamRevision: 0,
                            id: '123',
                            commitId: '1123',
                            commitStamp: new Date(Date.now() + 50),
                            commitSequence: 0,
                            payload: {
                                event: 'bla2',
                            },
                            applyMappings: () => {},
                        },
                    ]

                    var stream4 = [
                        {
                            aggregateId: 'idWithCont',
                            context: 'myCont',
                            streamRevision: 0,
                            id: '124',
                            commitId: '1124',
                            commitStamp: new Date(Date.now() + 60),
                            commitSequence: 0,
                            payload: {
                                event: 'bla',
                            },
                            applyMappings: () => {},
                        },
                        {
                            aggregateId: 'idWithCont',
                            context: 'myCont',
                            streamRevision: 1,
                            id: '125',
                            commitId: '1124',
                            commitStamp: new Date(Date.now() + 60),
                            commitSequence: 1,
                            payload: {
                                event: 'bla2',
                            },
                            applyMappings: () => {},
                        },
                    ]

                    var stream5 = [
                        {
                            aggregateId: 'id', // id already existing...
                            context: 'myCont',
                            streamRevision: 0,
                            id: '126',
                            commitId: '1126',
                            commitStamp: new Date(Date.now() + 80),
                            commitSequence: 0,
                            payload: {
                                event: 'bla2',
                            },
                            applyMappings: () => {},
                        },
                    ]

                    var stream6 = [
                        {
                            aggregateId: 'idWithAggrAndCont',
                            aggregate: 'myAggrrr',
                            context: 'myConttttt',
                            streamRevision: 0,
                            id: '127',
                            commitId: '1127',
                            commitStamp: new Date(Date.now() + 90),
                            commitSequence: 0,
                            payload: {
                                event: 'bla',
                            },
                            applyMappings: () => {},
                        },
                        {
                            aggregateId: 'idWithAggrAndCont',
                            aggregate: 'myAggrrr',
                            context: 'myConttttt',
                            streamRevision: 1,
                            id: '128',
                            commitId: '1127',
                            commitStamp: new Date(Date.now() + 90),
                            commitSequence: 1,
                            payload: {
                                event: 'bla2',
                            },
                            applyMappings: () => {},
                        },
                    ]

                    var stream7 = [
                        {
                            aggregateId: 'idWithAggrAndCont2',
                            aggregate: 'myAggrrr2',
                            context: 'myConttttt',
                            streamRevision: 0,
                            id: '129',
                            commitId: '1129',
                            commitStamp: new Date(Date.now() + 110),
                            commitSequence: 0,
                            payload: {
                                event: 'bla',
                            },
                            applyMappings: () => {},
                        },
                        {
                            aggregateId: 'idWithAggrAndCont2',
                            aggregate: 'myAggrrr2',
                            context: 'myConttttt',
                            streamRevision: 1,
                            id: '130',
                            commitId: '1129',
                            commitStamp: new Date(Date.now() + 110),
                            commitSequence: 1,
                            payload: {
                                event: 'bla2',
                            },
                            applyMappings: () => {},
                        },
                    ]

                    var stream8 = [
                        {
                            aggregateId: 'idWithAggrAndCont2',
                            aggregate: 'myAggrrr',
                            context: 'myConttttt',
                            streamRevision: 0,
                            id: '131',
                            commitId: '1131',
                            commitStamp: new Date(Date.now() + 130),
                            commitSequence: 0,
                            payload: {
                                event: 'bla',
                            },
                            applyMappings: () => {},
                        },
                    ]

                    var stream9 = [
                        {
                            aggregateId: 'idWithAggrAndCont',
                            aggregate: 'myAggrrr2',
                            context: 'myConttttt',
                            streamRevision: 0,
                            id: '132',
                            commitId: '1132',
                            commitStamp: new Date(Date.now() + 140),
                            commitSequence: 0,
                            payload: {
                                event: 'bla2',
                            },
                            applyMappings: () => {},
                        },
                    ]

                    var stream10 = [
                        {
                            aggregateId: 'id', // id already existing...
                            aggregate: 'wowAgg',
                            context: 'wowCont',
                            streamRevision: 0,
                            id: '133',
                            commitId: '1133',
                            commitStamp: new Date(Date.now() + 150),
                            commitSequence: 0,
                            payload: {
                                event: 'bla2',
                            },
                            applyMappings: () => {},
                        },
                    ]

                    var allEvents = []
                        .concat(stream1)
                        .concat(stream2)
                        .concat(stream3)
                        .concat(stream4)
                        .concat(stream5)
                        .concat(stream6)
                        .concat(stream7)
                        .concat(stream8)
                        .concat(stream9)
                        .concat(stream10)

                    beforeEach(function (done) {
                        async.series(
                            [
                                function (callback) {
                                    store.addEvents(stream1, callback)
                                },
                                function (callback) {
                                    store.addEvents(stream2, callback)
                                },
                                function (callback) {
                                    store.addEvents(stream3, callback)
                                },
                                function (callback) {
                                    store.addEvents(stream4, callback)
                                },
                                function (callback) {
                                    store.addEvents(stream5, callback)
                                },
                                function (callback) {
                                    store.addEvents(stream6, callback)
                                },
                                function (callback) {
                                    store.addEvents(stream7, callback)
                                },
                                function (callback) {
                                    store.addEvents(stream8, callback)
                                },
                                function (callback) {
                                    store.addEvents(stream9, callback)
                                },
                                function (callback) {
                                    store.addEvents(stream10, callback)
                                },
                            ],
                            done
                        )
                    })

                    describe('calling getEventsSince', () => {
                        describe('to get all events since a date', () => {
                            it('it should return the correct values', function (done) {
                                var expectedEvts = allEvents.slice(4)

                                store.getEventsSince(dateSince, 0, -1, function (err, evts) {
                                    expect(err).not.toBeTruthy()
                                    expect(evts.length).toEqual(expectedEvts.length)

                                    var lastCommitStamp = 0
                                    var lastCommitId = 0
                                    var lastId = 0
                                    _.each(evts, function (evt) {
                                        expect(evt.id | 0).toBeGreaterThan(lastId)
                                        expect(evt.commitId >= lastCommitId).toEqual(true)
                                        expect(
                                            evt.commitStamp.getTime() >= lastCommitStamp
                                        ).toEqual(true)
                                        lastId = evt.id | 0
                                        lastCommitId = evt.commitId
                                        lastCommitStamp = evt.commitStamp.getTime()
                                    })

                                    done()
                                })
                            })

                            describe('with a skip value', () => {
                                it('it should return the correct values', function (done) {
                                    var expectedEvts = allEvents.slice(7)

                                    store.getEventsSince(dateSince, 3, -1, function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(expectedEvts.length)

                                        var lastCommitStamp = 0
                                        var lastCommitId = 0
                                        var lastId = 0
                                        _.each(evts, function (evt) {
                                            expect(evt.id | 0).toBeGreaterThan(lastId)
                                            expect(evt.commitId >= lastCommitId).toEqual(true)
                                            expect(
                                                evt.commitStamp.getTime() >= lastCommitStamp
                                            ).toEqual(true)
                                            lastId = evt.id | 0
                                            lastCommitId = evt.commitId
                                            lastCommitStamp = evt.commitStamp.getTime()
                                        })

                                        done()
                                    })
                                })
                            })

                            describe('with a limit value', () => {
                                it('it should return the correct values', function (done) {
                                    var expectedEvts = allEvents.slice(4, 9)

                                    store.getEventsSince(dateSince, 0, 5, function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(expectedEvts.length)

                                        var lastCommitStamp = 0
                                        var lastCommitId = 0
                                        var lastId = 0
                                        _.each(evts, function (evt) {
                                            expect(evt.id | 0).toBeGreaterThan(lastId)
                                            expect(evt.commitId >= lastCommitId).toEqual(true)
                                            expect(
                                                evt.commitStamp.getTime() >= lastCommitStamp
                                            ).toEqual(true)
                                            lastId = evt.id | 0
                                            lastCommitId = evt.commitId
                                            lastCommitStamp = evt.commitStamp.getTime()
                                        })

                                        done()
                                    })
                                })
                            })

                            describe('with a skip and a limit value', () => {
                                it('it should return the correct values', function (done) {
                                    var expectedEvts = allEvents.slice(7, 9)

                                    store.getEventsSince(dateSince, 4, 2, function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(expectedEvts.length)

                                        var lastCommitStamp = 0
                                        var lastCommitId = 0
                                        var lastId = 0
                                        _.each(evts, function (evt) {
                                            expect(evt.id | 0).toBeGreaterThan(lastId)
                                            expect(evt.commitId >= lastCommitId).toEqual(true)
                                            expect(
                                                evt.commitStamp.getTime() >= lastCommitStamp
                                            ).toEqual(true)
                                            lastId = evt.id | 0
                                            lastCommitId = evt.commitId
                                            lastCommitStamp = evt.commitStamp.getTime()
                                        })

                                        done()
                                    })
                                })
                            })
                        })

                        describe('with an aggregateId being used only in one context and aggregate', () => {
                            it('it should return the correct events', function (done) {
                                store.getEvents(
                                    { aggregateId: 'idWithAgg' },
                                    0,
                                    -1,
                                    function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(2)
                                        expect(evts[0].id).toEqual(stream2[0].id)
                                        expect(evts[0].aggregateId).toEqual(stream2[0].aggregateId)
                                        expect(evts[0].commitStamp.getTime()).toEqual(
                                            stream2[0].commitStamp.getTime()
                                        )
                                        expect(evts[0].commitSequence).toEqual(
                                            stream2[0].commitSequence
                                        )
                                        expect(evts[0].streamRevision).toEqual(
                                            stream2[0].streamRevision
                                        )
                                        expect(evts[1].id).toEqual(stream2[1].id)
                                        expect(evts[1].aggregateId).toEqual(stream2[1].aggregateId)
                                        expect(evts[1].commitStamp.getTime()).toEqual(
                                            stream2[1].commitStamp.getTime()
                                        )
                                        expect(evts[1].commitSequence).toEqual(
                                            stream2[1].commitSequence
                                        )
                                        expect(evts[1].streamRevision).toEqual(
                                            stream2[1].streamRevision
                                        )

                                        done()
                                    }
                                )
                            })

                            describe('and limit it with skip and limit', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEvents(
                                        { aggregateId: 'idWithAgg' },
                                        1,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(1)
                                            expect(evts[0].aggregateId).toEqual(
                                                stream2[1].aggregateId
                                            )
                                            expect(evts[0].commitStamp.getTime()).toEqual(
                                                stream2[1].commitStamp.getTime()
                                            )
                                            expect(evts[0].streamRevision).toEqual(
                                                stream2[1].streamRevision
                                            )

                                            store.getLastEvent(
                                                { aggregateId: 'idWithAgg' },
                                                function (err, evt) {
                                                    expect(err).not.toBeTruthy()

                                                    expect(evt.aggregateId).toEqual(
                                                        stream2[1].aggregateId
                                                    )
                                                    expect(evt.commitStamp.getTime()).toEqual(
                                                        stream2[1].commitStamp.getTime()
                                                    )
                                                    expect(evt.streamRevision).toEqual(
                                                        stream2[1].streamRevision
                                                    )
                                                    done()
                                                }
                                            )
                                        }
                                    )
                                })
                            })
                        })

                        describe('with an aggregateId being used in an other context or aggregate', () => {
                            it('it should return the correct events', function (done) {
                                store.getEvents({ aggregateId: 'id' }, 0, -1, function (err, evts) {
                                    expect(err).not.toBeTruthy()
                                    expect(evts.length).toEqual(5)
                                    expect(evts[0].aggregateId).toEqual(stream1[0].aggregateId)
                                    expect(evts[0].commitStamp.getTime()).toEqual(
                                        stream1[0].commitStamp.getTime()
                                    )
                                    expect(evts[0].streamRevision).toEqual(
                                        stream1[0].streamRevision
                                    )
                                    expect(evts[1].aggregateId).toEqual(stream1[1].aggregateId)
                                    expect(evts[1].commitStamp.getTime()).toEqual(
                                        stream1[1].commitStamp.getTime()
                                    )
                                    expect(evts[1].streamRevision).toEqual(
                                        stream1[1].streamRevision
                                    )
                                    expect(evts[2].aggregateId).toEqual(stream3[0].aggregateId)
                                    expect(evts[2].commitStamp.getTime()).toEqual(
                                        stream3[0].commitStamp.getTime()
                                    )
                                    expect(evts[2].streamRevision).toEqual(
                                        stream3[0].streamRevision
                                    )
                                    expect(evts[3].aggregateId).toEqual(stream5[0].aggregateId)
                                    expect(evts[3].commitStamp.getTime()).toEqual(
                                        stream5[0].commitStamp.getTime()
                                    )
                                    expect(evts[3].streamRevision).toEqual(
                                        stream5[0].streamRevision
                                    )
                                    expect(evts[4].aggregateId).toEqual(stream10[0].aggregateId)
                                    expect(evts[4].commitStamp.getTime()).toEqual(
                                        stream10[0].commitStamp.getTime()
                                    )
                                    expect(evts[4].streamRevision).toEqual(
                                        stream10[0].streamRevision
                                    )

                                    done()
                                })
                            })

                            describe('and limit it with revMin and revMax', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEvents(
                                        { aggregateId: 'id' },
                                        1,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(2)
                                            expect(evts[0].aggregateId).toEqual(
                                                stream1[1].aggregateId
                                            )
                                            expect(evts[0].commitStamp.getTime()).toEqual(
                                                stream1[1].commitStamp.getTime()
                                            )
                                            expect(evts[0].streamRevision).toEqual(
                                                stream1[1].streamRevision
                                            )

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('without an aggregateId but with an aggregate', () => {
                            it('it should return the correct events', function (done) {
                                store.getEvents(
                                    { aggregate: 'myAggrrr2' },
                                    0,
                                    -1,
                                    function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(3)
                                        expect(evts[0].aggregateId).toEqual(stream7[0].aggregateId)
                                        expect(evts[0].commitStamp.getTime()).toEqual(
                                            stream7[0].commitStamp.getTime()
                                        )
                                        expect(evts[0].streamRevision).toEqual(
                                            stream7[0].streamRevision
                                        )
                                        expect(evts[1].aggregateId).toEqual(stream7[1].aggregateId)
                                        expect(evts[1].commitStamp.getTime()).toEqual(
                                            stream7[1].commitStamp.getTime()
                                        )
                                        expect(evts[1].streamRevision).toEqual(
                                            stream7[1].streamRevision
                                        )
                                        expect(evts[2].aggregateId).toEqual(stream9[0].aggregateId)
                                        expect(evts[2].commitStamp.getTime()).toEqual(
                                            stream9[0].commitStamp.getTime()
                                        )
                                        expect(evts[2].streamRevision).toEqual(
                                            stream9[0].streamRevision
                                        )

                                        done()
                                    }
                                )
                            })

                            describe('and limit it with skip and limit', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEvents(
                                        { aggregate: 'myAggrrr2' },
                                        1,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(2)
                                            expect(evts[0].aggregateId).toEqual(
                                                stream7[1].aggregateId
                                            )
                                            expect(evts[0].commitStamp.getTime()).toEqual(
                                                stream7[1].commitStamp.getTime()
                                            )
                                            expect(evts[0].streamRevision).toEqual(
                                                stream7[1].streamRevision
                                            )
                                            expect(evts[1].aggregateId).toEqual(
                                                stream9[0].aggregateId
                                            )
                                            expect(evts[1].commitStamp.getTime()).toEqual(
                                                stream9[0].commitStamp.getTime()
                                            )
                                            expect(evts[1].streamRevision).toEqual(
                                                stream9[0].streamRevision
                                            )

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('with an aggregateId and with an aggregate', () => {
                            it('it should return the correct events', function (done) {
                                store.getEvents(
                                    {
                                        aggregate: 'myAggrrr2',
                                        aggregateId: 'idWithAggrAndCont',
                                    },
                                    0,
                                    -1,
                                    function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(1)
                                        expect(evts[0].aggregateId).toEqual(stream9[0].aggregateId)
                                        expect(evts[0].commitStamp.getTime()).toEqual(
                                            stream9[0].commitStamp.getTime()
                                        )
                                        expect(evts[0].streamRevision).toEqual(
                                            stream9[0].streamRevision
                                        )

                                        done()
                                    }
                                )
                            })

                            describe('and limit it with skip and limit', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEvents(
                                        {
                                            aggregate: 'myAggrrr2',
                                            aggregateId: 'idWithAggrAndCont',
                                        },
                                        1,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(0)

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('with an aggregateId and without an aggregate but with a context', () => {
                            it('it should return the correct events', function (done) {
                                store.getEvents(
                                    { aggregateId: 'idWithAggrAndCont', context: 'myConttttt' },
                                    0,
                                    -1,
                                    function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(3)
                                        expect(evts[0].aggregateId).toEqual(stream6[0].aggregateId)
                                        expect(evts[0].commitStamp.getTime()).toEqual(
                                            stream6[0].commitStamp.getTime()
                                        )
                                        expect(evts[0].streamRevision).toEqual(
                                            stream6[0].streamRevision
                                        )
                                        expect(evts[1].aggregateId).toEqual(stream6[1].aggregateId)
                                        expect(evts[1].commitStamp.getTime()).toEqual(
                                            stream6[1].commitStamp.getTime()
                                        )
                                        expect(evts[1].streamRevision).toEqual(
                                            stream6[1].streamRevision
                                        )
                                        expect(evts[2].aggregateId).toEqual(stream9[0].aggregateId)
                                        expect(evts[2].commitStamp.getTime()).toEqual(
                                            stream9[0].commitStamp.getTime()
                                        )
                                        expect(evts[2].streamRevision).toEqual(
                                            stream9[0].streamRevision
                                        )

                                        done()
                                    }
                                )
                            })

                            describe('and limit it with skip and limit', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEvents(
                                        {
                                            aggregateId: 'idWithAggrAndCont',
                                            context: 'myConttttt',
                                        },
                                        1,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(2)
                                            expect(evts[0].aggregateId).toEqual(
                                                stream6[1].aggregateId
                                            )
                                            expect(evts[0].commitStamp.getTime()).toEqual(
                                                stream6[1].commitStamp.getTime()
                                            )
                                            expect(evts[0].streamRevision).toEqual(
                                                stream6[1].streamRevision
                                            )
                                            expect(evts[1].aggregateId).toEqual(
                                                stream9[0].aggregateId
                                            )
                                            expect(evts[1].commitStamp.getTime()).toEqual(
                                                stream9[0].commitStamp.getTime()
                                            )
                                            expect(evts[1].streamRevision).toEqual(
                                                stream9[0].streamRevision
                                            )

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('with an aggregateId and with an aggregate and with a context', () => {
                            it('it should return the correct events', function (done) {
                                store.getEvents(
                                    {
                                        aggregateId: 'id',
                                        aggregate: 'wowAgg',
                                        context: 'wowCont',
                                    },
                                    0,
                                    -1,
                                    function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(1)
                                        expect(evts[0].aggregateId).toEqual(stream10[0].aggregateId)
                                        expect(evts[0].commitStamp.getTime()).toEqual(
                                            stream10[0].commitStamp.getTime()
                                        )
                                        expect(evts[0].streamRevision).toEqual(
                                            stream10[0].streamRevision
                                        )

                                        done()
                                    }
                                )
                            })

                            describe('and limit it with skip and limit', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEvents(
                                        {
                                            aggregateId: 'id',
                                            aggregate: 'wowAgg',
                                            context: 'wowCont',
                                        },
                                        1,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(0)

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('without an aggregateId and without an aggregate but with a context', () => {
                            it('it should return the correct events', function (done) {
                                store.getEvents({ context: 'myCont' }, 0, -1, function (err, evts) {
                                    expect(err).not.toBeTruthy()
                                    expect(evts.length).toEqual(3)
                                    expect(evts[0].aggregateId).toEqual(stream4[0].aggregateId)
                                    expect(evts[0].commitStamp.getTime()).toEqual(
                                        stream4[0].commitStamp.getTime()
                                    )
                                    expect(evts[0].streamRevision).toEqual(
                                        stream4[0].streamRevision
                                    )
                                    expect(evts[1].aggregateId).toEqual(stream4[1].aggregateId)
                                    expect(evts[1].commitStamp.getTime()).toEqual(
                                        stream4[1].commitStamp.getTime()
                                    )
                                    expect(evts[1].streamRevision).toEqual(
                                        stream4[1].streamRevision
                                    )
                                    expect(evts[2].aggregateId).toEqual(stream5[0].aggregateId)
                                    expect(evts[2].commitStamp.getTime()).toEqual(
                                        stream5[0].commitStamp.getTime()
                                    )
                                    expect(evts[2].streamRevision).toEqual(
                                        stream5[0].streamRevision
                                    )

                                    done()
                                })
                            })

                            describe('and limit it with skip and limit', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEvents(
                                        { context: 'myCont' },
                                        1,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(2)
                                            expect(evts[0].aggregateId).toEqual(
                                                stream4[1].aggregateId
                                            )
                                            expect(evts[0].commitStamp.getTime()).toEqual(
                                                stream4[1].commitStamp.getTime()
                                            )
                                            expect(evts[0].streamRevision).toEqual(
                                                stream4[1].streamRevision
                                            )
                                            expect(evts[1].aggregateId).toEqual(
                                                stream5[0].aggregateId
                                            )
                                            expect(evts[1].commitStamp.getTime()).toEqual(
                                                stream5[0].commitStamp.getTime()
                                            )
                                            expect(evts[1].streamRevision).toEqual(
                                                stream5[0].streamRevision
                                            )

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('without an aggregateId but with an aggregate and with a context', () => {
                            it('it should return the correct events', function (done) {
                                store.getEvents(
                                    { context: 'myConttttt', aggregate: 'myAggrrr' },
                                    0,
                                    -1,
                                    function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(3)
                                        expect(evts[0].aggregateId).toEqual(stream6[0].aggregateId)
                                        expect(evts[0].commitStamp.getTime()).toEqual(
                                            stream6[0].commitStamp.getTime()
                                        )
                                        expect(evts[0].streamRevision).toEqual(
                                            stream6[0].streamRevision
                                        )
                                        expect(evts[1].aggregateId).toEqual(stream6[1].aggregateId)
                                        expect(evts[1].commitStamp.getTime()).toEqual(
                                            stream6[1].commitStamp.getTime()
                                        )
                                        expect(evts[1].streamRevision).toEqual(
                                            stream6[1].streamRevision
                                        )
                                        expect(evts[2].aggregateId).toEqual(stream8[0].aggregateId)
                                        expect(evts[2].commitStamp.getTime()).toEqual(
                                            stream8[0].commitStamp.getTime()
                                        )
                                        expect(evts[2].streamRevision).toEqual(
                                            stream8[0].streamRevision
                                        )

                                        done()
                                    }
                                )
                            })

                            describe('and limit it with skip and limit', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEvents(
                                        { context: 'myConttttt', aggregate: 'myAggrrr' },
                                        1,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(2)
                                            expect(evts[0].aggregateId).toEqual(
                                                stream6[1].aggregateId
                                            )
                                            expect(evts[0].commitStamp.getTime()).toEqual(
                                                stream6[1].commitStamp.getTime()
                                            )
                                            expect(evts[0].streamRevision).toEqual(
                                                stream6[1].streamRevision
                                            )
                                            expect(evts[1].aggregateId).toEqual(
                                                stream8[0].aggregateId
                                            )
                                            expect(evts[1].commitStamp.getTime()).toEqual(
                                                stream8[0].commitStamp.getTime()
                                            )
                                            expect(evts[1].streamRevision).toEqual(
                                                stream8[0].streamRevision
                                            )

                                            done()
                                        }
                                    )
                                })
                            })
                        })
                    })

                    describe('calling getEvents', () => {
                        describe('to get all events', () => {
                            it('it should return the correct values', function (done) {
                                store.getEvents({}, 0, -1, function (err, evts) {
                                    expect(err).not.toBeTruthy()
                                    expect(evts.length).toEqual(allEvents.length)

                                    var lastCommitStamp = 0
                                    var lastCommitId = 0
                                    var lastId = 0
                                    _.each(evts, function (evt) {
                                        expect(evt.id | 0).toBeGreaterThan(lastId)
                                        expect(evt.commitId >= lastCommitId).toEqual(true)
                                        expect(
                                            evt.commitStamp.getTime() >= lastCommitStamp
                                        ).toEqual(true)
                                        lastId = evt.id | 0
                                        lastCommitId = evt.commitId
                                        lastCommitStamp = evt.commitStamp.getTime()
                                    })

                                    done()
                                })
                            })

                            describe('with a skip value', () => {
                                it('it should return the correct values', function (done) {
                                    var expectedEvts = allEvents.slice(3)

                                    store.getEvents({}, 3, -1, function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(expectedEvts.length)

                                        var lastCommitStamp = 0
                                        var lastCommitId = 0
                                        var lastId = 0
                                        _.each(evts, function (evt) {
                                            expect(evt.id | 0).toBeGreaterThan(lastId)
                                            expect(evt.commitId >= lastCommitId).toEqual(true)
                                            expect(
                                                evt.commitStamp.getTime() >= lastCommitStamp
                                            ).toEqual(true)
                                            lastId = evt.id | 0
                                            lastCommitId = evt.commitId
                                            lastCommitStamp = evt.commitStamp.getTime()
                                        })

                                        done()
                                    })
                                })
                            })

                            describe('with a limit value', () => {
                                it('it should return the correct values', function (done) {
                                    var expectedEvts = allEvents.slice(0, 5)

                                    store.getEvents({}, 0, 5, function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(expectedEvts.length)

                                        var lastCommitStamp = 0
                                        var lastCommitId = 0
                                        var lastId = 0
                                        _.each(evts, function (evt) {
                                            expect(evt.id | 0).toBeGreaterThan(lastId)
                                            expect(evt.commitId >= lastCommitId).toEqual(true)
                                            expect(
                                                evt.commitStamp.getTime() >= lastCommitStamp
                                            ).toEqual(true)
                                            lastId = evt.id | 0
                                            lastCommitId = evt.commitId
                                            lastCommitStamp = evt.commitStamp.getTime()
                                        })

                                        done()
                                    })
                                })
                            })

                            describe('with a skip and a limit value', () => {
                                it('it should return the correct values', function (done) {
                                    var expectedEvts = allEvents.slice(3, 5)

                                    store.getEvents({}, 3, 2, function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(expectedEvts.length)

                                        var lastCommitStamp = 0
                                        var lastCommitId = 0
                                        var lastId = 0
                                        _.each(evts, function (evt) {
                                            expect(evt.id | 0).toBeGreaterThan(lastId)
                                            expect(evt.commitId >= lastCommitId).toEqual(true)
                                            expect(
                                                evt.commitStamp.getTime() >= lastCommitStamp
                                            ).toEqual(true)
                                            lastId = evt.id | 0
                                            lastCommitId = evt.commitId
                                            lastCommitStamp = evt.commitStamp.getTime()
                                        })

                                        done()
                                    })
                                })
                            })
                        })

                        describe('with an aggregateId being used only in one context and aggregate', () => {
                            it('it should return the correct events', function (done) {
                                store.getEvents(
                                    { aggregateId: 'idWithAgg' },
                                    0,
                                    -1,
                                    function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(2)
                                        expect(evts[0].id).toEqual(stream2[0].id)
                                        expect(evts[0].aggregateId).toEqual(stream2[0].aggregateId)
                                        expect(evts[0].commitStamp.getTime()).toEqual(
                                            stream2[0].commitStamp.getTime()
                                        )
                                        expect(evts[0].commitSequence).toEqual(
                                            stream2[0].commitSequence
                                        )
                                        expect(evts[0].streamRevision).toEqual(
                                            stream2[0].streamRevision
                                        )
                                        expect(evts[1].id).toEqual(stream2[1].id)
                                        expect(evts[1].aggregateId).toEqual(stream2[1].aggregateId)
                                        expect(evts[1].commitStamp.getTime()).toEqual(
                                            stream2[1].commitStamp.getTime()
                                        )
                                        expect(evts[1].commitSequence).toEqual(
                                            stream2[1].commitSequence
                                        )
                                        expect(evts[1].streamRevision).toEqual(
                                            stream2[1].streamRevision
                                        )

                                        done()
                                    }
                                )
                            })

                            describe('and limit it with skip and limit', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEvents(
                                        { aggregateId: 'idWithAgg' },
                                        1,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(1)
                                            expect(evts[0].aggregateId).toEqual(
                                                stream2[1].aggregateId
                                            )
                                            expect(evts[0].commitStamp.getTime()).toEqual(
                                                stream2[1].commitStamp.getTime()
                                            )
                                            expect(evts[0].streamRevision).toEqual(
                                                stream2[1].streamRevision
                                            )

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('with an aggregateId being used in an other context or aggregate', () => {
                            it('it should return the correct events', function (done) {
                                store.getEvents({ aggregateId: 'id' }, 0, -1, function (err, evts) {
                                    expect(err).not.toBeTruthy()
                                    expect(evts.length).toEqual(5)
                                    expect(evts[0].aggregateId).toEqual(stream1[0].aggregateId)
                                    expect(evts[0].commitStamp.getTime()).toEqual(
                                        stream1[0].commitStamp.getTime()
                                    )
                                    expect(evts[0].streamRevision).toEqual(
                                        stream1[0].streamRevision
                                    )
                                    expect(evts[1].aggregateId).toEqual(stream1[1].aggregateId)
                                    expect(evts[1].commitStamp.getTime()).toEqual(
                                        stream1[1].commitStamp.getTime()
                                    )
                                    expect(evts[1].streamRevision).toEqual(
                                        stream1[1].streamRevision
                                    )
                                    expect(evts[2].aggregateId).toEqual(stream3[0].aggregateId)
                                    expect(evts[2].commitStamp.getTime()).toEqual(
                                        stream3[0].commitStamp.getTime()
                                    )
                                    expect(evts[2].streamRevision).toEqual(
                                        stream3[0].streamRevision
                                    )
                                    expect(evts[3].aggregateId).toEqual(stream5[0].aggregateId)
                                    expect(evts[3].commitStamp.getTime()).toEqual(
                                        stream5[0].commitStamp.getTime()
                                    )
                                    expect(evts[3].streamRevision).toEqual(
                                        stream5[0].streamRevision
                                    )
                                    expect(evts[4].aggregateId).toEqual(stream10[0].aggregateId)
                                    expect(evts[4].commitStamp.getTime()).toEqual(
                                        stream10[0].commitStamp.getTime()
                                    )
                                    expect(evts[4].streamRevision).toEqual(
                                        stream10[0].streamRevision
                                    )

                                    done()
                                })
                            })

                            describe('and limit it with revMin and revMax', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEvents(
                                        { aggregateId: 'id' },
                                        1,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(2)
                                            expect(evts[0].aggregateId).toEqual(
                                                stream1[1].aggregateId
                                            )
                                            expect(evts[0].commitStamp.getTime()).toEqual(
                                                stream1[1].commitStamp.getTime()
                                            )
                                            expect(evts[0].streamRevision).toEqual(
                                                stream1[1].streamRevision
                                            )

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('without an aggregateId but with an aggregate', () => {
                            it('it should return the correct events', function (done) {
                                store.getEvents(
                                    { aggregate: 'myAggrrr2' },
                                    0,
                                    -1,
                                    function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(3)
                                        expect(evts[0].aggregateId).toEqual(stream7[0].aggregateId)
                                        expect(evts[0].commitStamp.getTime()).toEqual(
                                            stream7[0].commitStamp.getTime()
                                        )
                                        expect(evts[0].streamRevision).toEqual(
                                            stream7[0].streamRevision
                                        )
                                        expect(evts[1].aggregateId).toEqual(stream7[1].aggregateId)
                                        expect(evts[1].commitStamp.getTime()).toEqual(
                                            stream7[1].commitStamp.getTime()
                                        )
                                        expect(evts[1].streamRevision).toEqual(
                                            stream7[1].streamRevision
                                        )
                                        expect(evts[2].aggregateId).toEqual(stream9[0].aggregateId)
                                        expect(evts[2].commitStamp.getTime()).toEqual(
                                            stream9[0].commitStamp.getTime()
                                        )
                                        expect(evts[2].streamRevision).toEqual(
                                            stream9[0].streamRevision
                                        )

                                        done()
                                    }
                                )
                            })

                            describe('and limit it with skip and limit', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEvents(
                                        { aggregate: 'myAggrrr2' },
                                        1,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(2)
                                            expect(evts[0].aggregateId).toEqual(
                                                stream7[1].aggregateId
                                            )
                                            expect(evts[0].commitStamp.getTime()).toEqual(
                                                stream7[1].commitStamp.getTime()
                                            )
                                            expect(evts[0].streamRevision).toEqual(
                                                stream7[1].streamRevision
                                            )
                                            expect(evts[1].aggregateId).toEqual(
                                                stream9[0].aggregateId
                                            )
                                            expect(evts[1].commitStamp.getTime()).toEqual(
                                                stream9[0].commitStamp.getTime()
                                            )
                                            expect(evts[1].streamRevision).toEqual(
                                                stream9[0].streamRevision
                                            )

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('with an aggregateId and with an aggregate', () => {
                            it('it should return the correct events', function (done) {
                                store.getEvents(
                                    {
                                        aggregate: 'myAggrrr2',
                                        aggregateId: 'idWithAggrAndCont',
                                    },
                                    0,
                                    -1,
                                    function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(1)
                                        expect(evts[0].aggregateId).toEqual(stream9[0].aggregateId)
                                        expect(evts[0].commitStamp.getTime()).toEqual(
                                            stream9[0].commitStamp.getTime()
                                        )
                                        expect(evts[0].streamRevision).toEqual(
                                            stream9[0].streamRevision
                                        )

                                        done()
                                    }
                                )
                            })

                            describe('and limit it with skip and limit', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEvents(
                                        {
                                            aggregate: 'myAggrrr2',
                                            aggregateId: 'idWithAggrAndCont',
                                        },
                                        1,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(0)

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('with an aggregateId and without an aggregate but with a context', () => {
                            it('it should return the correct events', function (done) {
                                store.getEvents(
                                    { aggregateId: 'idWithAggrAndCont', context: 'myConttttt' },
                                    0,
                                    -1,
                                    function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(3)
                                        expect(evts[0].aggregateId).toEqual(stream6[0].aggregateId)
                                        expect(evts[0].commitStamp.getTime()).toEqual(
                                            stream6[0].commitStamp.getTime()
                                        )
                                        expect(evts[0].streamRevision).toEqual(
                                            stream6[0].streamRevision
                                        )
                                        expect(evts[1].aggregateId).toEqual(stream6[1].aggregateId)
                                        expect(evts[1].commitStamp.getTime()).toEqual(
                                            stream6[1].commitStamp.getTime()
                                        )
                                        expect(evts[1].streamRevision).toEqual(
                                            stream6[1].streamRevision
                                        )
                                        expect(evts[2].aggregateId).toEqual(stream9[0].aggregateId)
                                        expect(evts[2].commitStamp.getTime()).toEqual(
                                            stream9[0].commitStamp.getTime()
                                        )
                                        expect(evts[2].streamRevision).toEqual(
                                            stream9[0].streamRevision
                                        )

                                        done()
                                    }
                                )
                            })

                            describe('and limit it with skip and limit', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEvents(
                                        {
                                            aggregateId: 'idWithAggrAndCont',
                                            context: 'myConttttt',
                                        },
                                        1,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(2)
                                            expect(evts[0].aggregateId).toEqual(
                                                stream6[1].aggregateId
                                            )
                                            expect(evts[0].commitStamp.getTime()).toEqual(
                                                stream6[1].commitStamp.getTime()
                                            )
                                            expect(evts[0].streamRevision).toEqual(
                                                stream6[1].streamRevision
                                            )
                                            expect(evts[1].aggregateId).toEqual(
                                                stream9[0].aggregateId
                                            )
                                            expect(evts[1].commitStamp.getTime()).toEqual(
                                                stream9[0].commitStamp.getTime()
                                            )
                                            expect(evts[1].streamRevision).toEqual(
                                                stream9[0].streamRevision
                                            )

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('with an aggregateId and with an aggregate and with a context', () => {
                            it('it should return the correct events', function (done) {
                                store.getEvents(
                                    {
                                        aggregateId: 'id',
                                        aggregate: 'wowAgg',
                                        context: 'wowCont',
                                    },
                                    0,
                                    -1,
                                    function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(1)
                                        expect(evts[0].aggregateId).toEqual(stream10[0].aggregateId)
                                        expect(evts[0].commitStamp.getTime()).toEqual(
                                            stream10[0].commitStamp.getTime()
                                        )
                                        expect(evts[0].streamRevision).toEqual(
                                            stream10[0].streamRevision
                                        )

                                        done()
                                    }
                                )
                            })

                            describe('and limit it with skip and limit', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEvents(
                                        {
                                            aggregateId: 'id',
                                            aggregate: 'wowAgg',
                                            context: 'wowCont',
                                        },
                                        1,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(0)

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('without an aggregateId and without an aggregate but with a context', () => {
                            it('it should return the correct events', function (done) {
                                store.getEvents({ context: 'myCont' }, 0, -1, function (err, evts) {
                                    expect(err).not.toBeTruthy()
                                    expect(evts.length).toEqual(3)
                                    expect(evts[0].aggregateId).toEqual(stream4[0].aggregateId)
                                    expect(evts[0].commitStamp.getTime()).toEqual(
                                        stream4[0].commitStamp.getTime()
                                    )
                                    expect(evts[0].streamRevision).toEqual(
                                        stream4[0].streamRevision
                                    )
                                    expect(evts[1].aggregateId).toEqual(stream4[1].aggregateId)
                                    expect(evts[1].commitStamp.getTime()).toEqual(
                                        stream4[1].commitStamp.getTime()
                                    )
                                    expect(evts[1].streamRevision).toEqual(
                                        stream4[1].streamRevision
                                    )
                                    expect(evts[2].aggregateId).toEqual(stream5[0].aggregateId)
                                    expect(evts[2].commitStamp.getTime()).toEqual(
                                        stream5[0].commitStamp.getTime()
                                    )
                                    expect(evts[2].streamRevision).toEqual(
                                        stream5[0].streamRevision
                                    )

                                    done()
                                })
                            })

                            describe('and limit it with skip and limit', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEvents(
                                        { context: 'myCont' },
                                        1,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(2)
                                            expect(evts[0].aggregateId).toEqual(
                                                stream4[1].aggregateId
                                            )
                                            expect(evts[0].commitStamp.getTime()).toEqual(
                                                stream4[1].commitStamp.getTime()
                                            )
                                            expect(evts[0].streamRevision).toEqual(
                                                stream4[1].streamRevision
                                            )
                                            expect(evts[1].aggregateId).toEqual(
                                                stream5[0].aggregateId
                                            )
                                            expect(evts[1].commitStamp.getTime()).toEqual(
                                                stream5[0].commitStamp.getTime()
                                            )
                                            expect(evts[1].streamRevision).toEqual(
                                                stream5[0].streamRevision
                                            )

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('without an aggregateId but with an aggregate and with a context', () => {
                            it('it should return the correct events', function (done) {
                                store.getEvents(
                                    { context: 'myConttttt', aggregate: 'myAggrrr' },
                                    0,
                                    -1,
                                    function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(3)
                                        expect(evts[0].aggregateId).toEqual(stream6[0].aggregateId)
                                        expect(evts[0].commitStamp.getTime()).toEqual(
                                            stream6[0].commitStamp.getTime()
                                        )
                                        expect(evts[0].streamRevision).toEqual(
                                            stream6[0].streamRevision
                                        )
                                        expect(evts[1].aggregateId).toEqual(stream6[1].aggregateId)
                                        expect(evts[1].commitStamp.getTime()).toEqual(
                                            stream6[1].commitStamp.getTime()
                                        )
                                        expect(evts[1].streamRevision).toEqual(
                                            stream6[1].streamRevision
                                        )
                                        expect(evts[2].aggregateId).toEqual(stream8[0].aggregateId)
                                        expect(evts[2].commitStamp.getTime()).toEqual(
                                            stream8[0].commitStamp.getTime()
                                        )
                                        expect(evts[2].streamRevision).toEqual(
                                            stream8[0].streamRevision
                                        )

                                        done()
                                    }
                                )
                            })

                            describe('and limit it with skip and limit', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEvents(
                                        { context: 'myConttttt', aggregate: 'myAggrrr' },
                                        1,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(2)
                                            expect(evts[0].aggregateId).toEqual(
                                                stream6[1].aggregateId
                                            )
                                            expect(evts[0].commitStamp.getTime()).toEqual(
                                                stream6[1].commitStamp.getTime()
                                            )
                                            expect(evts[0].streamRevision).toEqual(
                                                stream6[1].streamRevision
                                            )
                                            expect(evts[1].aggregateId).toEqual(
                                                stream8[0].aggregateId
                                            )
                                            expect(evts[1].commitStamp.getTime()).toEqual(
                                                stream8[0].commitStamp.getTime()
                                            )
                                            expect(evts[1].streamRevision).toEqual(
                                                stream8[0].streamRevision
                                            )

                                            done()
                                        }
                                    )
                                })
                            })
                        })
                    })

                    describe('calling getEventsByRevision', () => {
                        describe('with an aggregateId being used only in one context and aggregate', () => {
                            it('it should return the correct events', function (done) {
                                store.getEventsByRevision(
                                    { aggregateId: 'idWithAgg' },
                                    0,
                                    -1,
                                    function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(2)
                                        expect(evts[0].aggregateId).toEqual(stream2[0].aggregateId)
                                        expect(evts[0].commitStamp.getTime()).toEqual(
                                            stream2[0].commitStamp.getTime()
                                        )
                                        expect(evts[0].streamRevision).toEqual(
                                            stream2[0].streamRevision
                                        )
                                        expect(evts[1].aggregateId).toEqual(stream2[1].aggregateId)
                                        expect(evts[1].commitStamp.getTime()).toEqual(
                                            stream2[1].commitStamp.getTime()
                                        )
                                        expect(evts[1].streamRevision).toEqual(
                                            stream2[1].streamRevision
                                        )

                                        done()
                                    }
                                )
                            })

                            describe('and limit it with revMin and revMax', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEventsByRevision(
                                        { aggregateId: 'idWithAgg' },
                                        1,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(1)
                                            expect(evts[0].aggregateId).toEqual(
                                                stream2[1].aggregateId
                                            )
                                            expect(evts[0].commitStamp.getTime()).toEqual(
                                                stream2[1].commitStamp.getTime()
                                            )
                                            expect(evts[0].streamRevision).toEqual(
                                                stream2[1].streamRevision
                                            )

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('with an aggregateId being used in an other context or aggregate', () => {
                            it('it should return the correct events', function (done) {
                                store.getEventsByRevision(
                                    { aggregateId: 'id' },
                                    0,
                                    -1,
                                    function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(5)
                                        expect(evts[0].aggregateId).toEqual(stream1[0].aggregateId)
                                        expect(evts[0].commitStamp.getTime()).toEqual(
                                            stream1[0].commitStamp.getTime()
                                        )
                                        expect(evts[0].streamRevision).toEqual(
                                            stream1[0].streamRevision
                                        )
                                        expect(evts[1].aggregateId).toEqual(stream1[1].aggregateId)
                                        expect(evts[1].commitStamp.getTime()).toEqual(
                                            stream1[1].commitStamp.getTime()
                                        )
                                        expect(evts[1].streamRevision).toEqual(
                                            stream1[1].streamRevision
                                        )
                                        expect(evts[2].aggregateId).toEqual(stream3[0].aggregateId)
                                        expect(evts[2].commitStamp.getTime()).toEqual(
                                            stream3[0].commitStamp.getTime()
                                        )
                                        expect(evts[2].streamRevision).toEqual(
                                            stream3[0].streamRevision
                                        )
                                        expect(evts[3].aggregateId).toEqual(stream5[0].aggregateId)
                                        expect(evts[3].commitStamp.getTime()).toEqual(
                                            stream5[0].commitStamp.getTime()
                                        )
                                        expect(evts[3].streamRevision).toEqual(
                                            stream5[0].streamRevision
                                        )
                                        expect(evts[4].aggregateId).toEqual(stream10[0].aggregateId)
                                        expect(evts[4].commitStamp.getTime()).toEqual(
                                            stream10[0].commitStamp.getTime()
                                        )
                                        expect(evts[4].streamRevision).toEqual(
                                            stream10[0].streamRevision
                                        )

                                        done()
                                    }
                                )
                            })

                            describe('and limit it with revMin and revMax', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEventsByRevision(
                                        { aggregateId: 'id' },
                                        1,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(1)
                                            expect(evts[0].aggregateId).toEqual(
                                                stream1[1].aggregateId
                                            )
                                            expect(evts[0].commitStamp.getTime()).toEqual(
                                                stream1[1].commitStamp.getTime()
                                            )
                                            expect(evts[0].streamRevision).toEqual(
                                                stream1[1].streamRevision
                                            )

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('with an aggregateId and with an aggregate', () => {
                            it('it should return the correct events', function (done) {
                                store.getEventsByRevision(
                                    {
                                        aggregate: 'myAggrrr2',
                                        aggregateId: 'idWithAggrAndCont',
                                    },
                                    0,
                                    -1,
                                    function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(1)
                                        expect(evts[0].aggregateId).toEqual(stream9[0].aggregateId)
                                        expect(evts[0].commitStamp.getTime()).toEqual(
                                            stream9[0].commitStamp.getTime()
                                        )
                                        expect(evts[0].streamRevision).toEqual(
                                            stream9[0].streamRevision
                                        )

                                        done()
                                    }
                                )
                            })

                            describe('and limit it with skip and limit', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEventsByRevision(
                                        {
                                            aggregate: 'myAggrrr2',
                                            aggregateId: 'idWithAggrAndCont',
                                        },
                                        1,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(0)

                                            done()
                                        }
                                    )
                                })
                            })

                            describe('and an other combination of limit and skip', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEventsByRevision(
                                        {
                                            aggregate: 'myAggrrr2',
                                            aggregateId: 'idWithAggrAndCont',
                                        },
                                        0,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(1)

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('with an aggregateId and with an aggregate and with a context', () => {
                            it('it should return the correct events', function (done) {
                                store.getEventsByRevision(
                                    {
                                        aggregateId: 'id',
                                        aggregate: 'wowAgg',
                                        context: 'wowCont',
                                    },
                                    0,
                                    -1,
                                    function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(1)
                                        expect(evts[0].aggregateId).toEqual(stream10[0].aggregateId)
                                        expect(evts[0].commitStamp.getTime()).toEqual(
                                            stream10[0].commitStamp.getTime()
                                        )
                                        expect(evts[0].streamRevision).toEqual(
                                            stream10[0].streamRevision
                                        )

                                        done()
                                    }
                                )
                            })

                            describe('and limit it with skip and limit', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEventsByRevision(
                                        {
                                            aggregateId: 'id',
                                            aggregate: 'wowAgg',
                                            context: 'wowCont',
                                        },
                                        1,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(0)

                                            done()
                                        }
                                    )
                                })
                            })

                            describe('and an other combination of limit and skip', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEventsByRevision(
                                        {
                                            aggregateId: 'id',
                                            aggregate: 'wowAgg',
                                            context: 'wowCont',
                                        },
                                        0,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(1)

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('with an aggregateId and without an aggregate but with a context', () => {
                            it('it should return the correct events', function (done) {
                                store.getEventsByRevision(
                                    { aggregateId: 'idWithAggrAndCont', context: 'myConttttt' },
                                    0,
                                    -1,
                                    function (err, evts) {
                                        expect(err).not.toBeTruthy()
                                        expect(evts.length).toEqual(3)
                                        expect(evts[0].aggregateId).toEqual(stream6[0].aggregateId)
                                        expect(evts[0].commitStamp.getTime()).toEqual(
                                            stream6[0].commitStamp.getTime()
                                        )
                                        expect(evts[0].streamRevision).toEqual(
                                            stream6[0].streamRevision
                                        )
                                        expect(evts[1].aggregateId).toEqual(stream6[1].aggregateId)
                                        expect(evts[1].commitStamp.getTime()).toEqual(
                                            stream6[1].commitStamp.getTime()
                                        )
                                        expect(evts[1].streamRevision).toEqual(
                                            stream6[1].streamRevision
                                        )
                                        expect(evts[2].aggregateId).toEqual(stream9[0].aggregateId)
                                        expect(evts[2].commitStamp.getTime()).toEqual(
                                            stream9[0].commitStamp.getTime()
                                        )
                                        expect(evts[2].streamRevision).toEqual(
                                            stream9[0].streamRevision
                                        )

                                        done()
                                    }
                                )
                            })

                            describe('and limit it with skip and limit', () => {
                                it('it should return the correct events', function (done) {
                                    store.getEventsByRevision(
                                        {
                                            aggregateId: 'idWithAggrAndCont',
                                            context: 'myConttttt',
                                        },
                                        1,
                                        2,
                                        function (err, evts) {
                                            expect(err).not.toBeTruthy()
                                            expect(evts.length).toEqual(1)
                                            expect(evts[0].aggregateId).toEqual(
                                                stream6[1].aggregateId
                                            )
                                            expect(evts[0].commitStamp.getTime()).toEqual(
                                                stream6[1].commitStamp.getTime()
                                            )
                                            expect(evts[0].streamRevision).toEqual(
                                                stream6[1].streamRevision
                                            )

                                            done()
                                        }
                                    )
                                })
                            })
                        })
                    })
                })

                describe('adding some events', () => {
                    var stream = [
                        {
                            aggregateId: 'id',
                            streamRevision: 0,
                            id: '119',
                            commitId: '11119',
                            commitStamp: new Date(Date.now() + 10),
                            commitSequence: 0,
                            payload: {
                                event: 'bla',
                            },
                            applyMappings: () => {},
                        },
                        {
                            aggregateId: 'id',
                            streamRevision: 1,
                            id: '120',
                            commitId: '11119',
                            commitStamp: new Date(Date.now() + 10),
                            commitSequence: 1,
                            payload: {
                                event: 'bla2',
                            },
                            applyMappings: () => {},
                        },
                    ]

                    beforeEach(function (done) {
                        store.addEvents(stream, done)
                    })

                    describe('and requesting all undispatched events', () => {
                        it('it should return the correct events', function (done) {
                            store.getUndispatchedEvents(null, function (err, evts) {
                                expect(err).not.toBeTruthy()
                                expect(evts.length).toEqual(2)
                                expect(evts[0].id).toEqual(stream[0].id)
                                expect(evts[0].commitId).toEqual(stream[0].commitId)
                                expect(evts[0].commitStamp.getTime()).toEqual(
                                    stream[0].commitStamp.getTime()
                                )
                                expect(evts[1].id).toEqual(stream[1].id)
                                expect(evts[1].commitId).toEqual(stream[1].commitId)
                                expect(evts[1].commitStamp.getTime()).toEqual(
                                    stream[1].commitStamp.getTime()
                                )

                                done()
                            })
                        })
                    })

                    describe('calling setEventToDispatched', () => {
                        beforeEach(function (done) {
                            store.getUndispatchedEvents(null, function (err, evts) {
                                expect(evts.length).toEqual(2)
                                done()
                            })
                        })

                        it('it should work correctly', function (done) {
                            store.setEventToDispatched('119', function (err) {
                                expect(err).not.toBeTruthy()

                                store.getUndispatchedEvents(null, function (err, evts) {
                                    expect(err).not.toBeTruthy()
                                    expect(evts.length).toEqual(1)
                                    expect(evts[0].commitId).toEqual(stream[1].commitId)
                                    expect(evts[0].commitStamp.getTime()).toEqual(
                                        stream[1].commitStamp.getTime()
                                    )

                                    done()
                                })
                            })
                        })
                    })
                })

                describe('calling addSnapshot', () => {
                    var snap = {
                        id: '12345',
                        aggregateId: '920193847',
                        aggregate: 'myCoolAggregate',
                        context: 'myEvenCoolerContext',
                        commitStamp: new Date(Date.now() + 400),
                        revision: 3,
                        version: 1,
                        data: {
                            mySnappi: 'data',
                        },
                    }

                    it('it should save the snapshot', function (done) {
                        store.addSnapshot(snap, function (err) {
                            expect(err).not.toBeTruthy()

                            store.getSnapshot(
                                { aggregateId: snap.aggregateId },
                                -1,
                                function (err, shot) {
                                    expect(err).not.toBeTruthy()
                                    expect(shot.id).toEqual(snap.id)
                                    expect(shot.aggregateId).toEqual(snap.aggregateId)
                                    expect(shot.aggregate).toEqual(snap.aggregate)
                                    expect(shot.context).toEqual(snap.context)
                                    expect(shot.commitStamp.getTime()).toEqual(
                                        snap.commitStamp.getTime()
                                    )
                                    expect(shot.revision).toEqual(snap.revision)
                                    expect(shot.version).toEqual(snap.version)
                                    expect(shot.data.mySnappi).toEqual(snap.data.mySnappi)

                                    done()
                                }
                            )
                        })
                    })

                    describe('having some snapshots in the eventstore calling getSnapshot', () => {
                        var snap1 = {
                            id: '12345',
                            aggregateId: '920193847',
                            commitStamp: new Date(Date.now() + 405),
                            revision: 3,
                            version: 1,
                            data: {
                                mySnappi: 'data',
                            },
                        }

                        var snap2 = {
                            id: '123456',
                            aggregateId: '920193847',
                            commitStamp: new Date(Date.now() + 410),
                            revision: 8,
                            version: 1,
                            data: {
                                mySnappi: 'data2',
                            },
                        }

                        var snap3 = {
                            id: '1234567',
                            aggregateId: '142351',
                            aggregate: 'myCoolAggregate',
                            context: 'conntttt',
                            commitStamp: new Date(Date.now() + 420),
                            revision: 5,
                            version: 1,
                            data: {
                                mySnappi: 'data2',
                            },
                        }

                        var snap4 = {
                            id: '12345678',
                            aggregateId: '920193847',
                            aggregate: 'myCoolAggregate',
                            commitStamp: new Date(Date.now() + 430),
                            revision: 9,
                            version: 1,
                            data: {
                                mySnappi: 'data6',
                            },
                        }

                        var snap5 = {
                            id: '123456789',
                            aggregateId: '938179341',
                            aggregate: 'myCoolAggregate',
                            context: 'myCoolContext',
                            commitStamp: new Date(Date.now() + 440),
                            revision: 2,
                            version: 1,
                            data: {
                                mySnappi: 'dataXY',
                            },
                        }

                        var snap6 = {
                            id: '12345678910',
                            aggregateId: '920193847',
                            aggregate: 'myCoolAggregate2',
                            context: 'myCoolContext',
                            commitStamp: new Date(Date.now() + 450),
                            revision: 12,
                            version: 1,
                            data: {
                                mySnappi: 'dataaaaa',
                            },
                        }

                        var snap7 = {
                            id: '123456789104',
                            aggregateId: '920193847313131313',
                            aggregate: 'myCoolAggregate2',
                            context: 'myCoolContext',
                            commitStamp: new Date(Date.now() + 555),
                            revision: 16,
                            version: 2,
                            data: {
                                mySnappi: 'dataaaaa2',
                            },
                        }

                        var snap8 = {
                            id: '123456789102',
                            aggregateId: '920193847313131313',
                            aggregate: 'myCoolAggregate2',
                            context: 'myCoolContext',
                            commitStamp: new Date(Date.now() + 575),
                            revision: 16,
                            version: 3,
                            data: {
                                mySnappi: 'dataaaaa3',
                            },
                        }

                        beforeEach(function (done) {
                            async.series(
                                [
                                    function (callback) {
                                        store.addSnapshot(snap1, callback)
                                    },
                                    function (callback) {
                                        store.addSnapshot(snap2, callback)
                                    },
                                    function (callback) {
                                        store.addSnapshot(snap3, callback)
                                    },
                                    function (callback) {
                                        store.addSnapshot(snap4, callback)
                                    },
                                    function (callback) {
                                        store.addSnapshot(snap5, callback)
                                    },
                                    function (callback) {
                                        store.addSnapshot(snap6, callback)
                                    },
                                    function (callback) {
                                        store.addSnapshot(snap7, callback)
                                    },
                                    function (callback) {
                                        store.addSnapshot(snap8, callback)
                                    },
                                ],
                                done
                            )
                        })

                        describe('with an aggregateId being used only in one context and aggregate', () => {
                            it('it should return the correct snapshot', function (done) {
                                store.getSnapshot(
                                    { aggregateId: '142351' },
                                    -1,
                                    function (err, shot) {
                                        expect(err).not.toBeTruthy()
                                        expect(shot.id).toEqual(snap3.id)
                                        expect(shot.aggregateId).toEqual(snap3.aggregateId)
                                        expect(shot.aggregate).toEqual(snap3.aggregate)
                                        expect(shot.context).toEqual(snap3.context)
                                        expect(shot.commitStamp.getTime()).toEqual(
                                            snap3.commitStamp.getTime()
                                        )
                                        expect(shot.revision).toEqual(snap3.revision)
                                        expect(shot.version).toEqual(snap3.version)
                                        expect(shot.data.mySnappi).toEqual(snap3.data.mySnappi)

                                        done()
                                    }
                                )
                            })

                            describe('and limit it with revMax', () => {
                                it('it should return the correct snapshot', function (done) {
                                    store.getSnapshot(
                                        { aggregateId: '142351' },
                                        1,
                                        function (err, shot) {
                                            expect(err).not.toBeTruthy()
                                            expect(shot).not.toBeTruthy()

                                            done()
                                        }
                                    )
                                })
                            })

                            describe('and an other revMax', () => {
                                it('it should return the correct snapshot', function (done) {
                                    store.getSnapshot(
                                        { aggregateId: '142351' },
                                        5,
                                        function (err, shot) {
                                            expect(err).not.toBeTruthy()
                                            expect(shot.id).toEqual(snap3.id)
                                            expect(shot.aggregateId).toEqual(snap3.aggregateId)
                                            expect(shot.aggregate).toEqual(snap3.aggregate)
                                            expect(shot.context).toEqual(snap3.context)
                                            expect(shot.commitStamp.getTime()).toEqual(
                                                snap3.commitStamp.getTime()
                                            )
                                            expect(shot.revision).toEqual(snap3.revision)
                                            expect(shot.version).toEqual(snap3.version)
                                            expect(shot.data.mySnappi).toEqual(snap3.data.mySnappi)

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('with an aggregateId being used in an other context or aggregate', () => {
                            it('it should return the correct snapshot', function (done) {
                                store.getSnapshot(
                                    { aggregateId: '920193847' },
                                    -1,
                                    function (err, shot) {
                                        expect(err).not.toBeTruthy()
                                        expect(shot.id).toEqual(snap6.id)
                                        expect(shot.aggregateId).toEqual(snap6.aggregateId)
                                        expect(shot.aggregate).toEqual(snap6.aggregate)
                                        expect(shot.context).toEqual(snap6.context)
                                        expect(shot.commitStamp.getTime()).toEqual(
                                            snap6.commitStamp.getTime()
                                        )
                                        expect(shot.revision).toEqual(snap6.revision)
                                        expect(shot.version).toEqual(snap6.version)
                                        expect(shot.data.mySnappi).toEqual(snap6.data.mySnappi)

                                        done()
                                    }
                                )
                            })

                            describe('and limit it with revMax', () => {
                                it('it should return the correct snapshot', function (done) {
                                    store.getSnapshot(
                                        { aggregateId: '920193847' },
                                        1,
                                        function (err, shot) {
                                            expect(err).not.toBeTruthy()
                                            expect(shot).not.toBeTruthy()

                                            done()
                                        }
                                    )
                                })
                            })

                            describe('and an other revMax', () => {
                                it('it should return the correct snapshot', function (done) {
                                    store.getSnapshot(
                                        { aggregateId: '920193847' },
                                        5,
                                        function (err, shot) {
                                            expect(err).not.toBeTruthy()
                                            expect(shot.id).toEqual(snap1.id)
                                            expect(shot.aggregateId).toEqual(snap1.aggregateId)
                                            expect(shot.aggregate).toEqual(snap1.aggregate)
                                            expect(shot.context).toEqual(snap1.context)
                                            expect(shot.commitStamp.getTime()).toEqual(
                                                snap1.commitStamp.getTime()
                                            )
                                            expect(shot.revision).toEqual(snap1.revision)
                                            expect(shot.version).toEqual(snap1.version)
                                            expect(shot.data.mySnappi).toEqual(snap1.data.mySnappi)

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('with an aggregateId and with an aggregate', () => {
                            it('it should return the correct snapshot', function (done) {
                                store.getSnapshot(
                                    { aggregateId: '920193847', aggregate: 'myCoolAggregate' },
                                    -1,
                                    function (err, shot) {
                                        expect(err).not.toBeTruthy()
                                        expect(shot.id).toEqual(snap4.id)
                                        expect(shot.aggregateId).toEqual(snap4.aggregateId)
                                        expect(shot.aggregate).toEqual(snap4.aggregate)
                                        expect(shot.context).toEqual(snap4.context)
                                        expect(shot.commitStamp.getTime()).toEqual(
                                            snap4.commitStamp.getTime()
                                        )
                                        expect(shot.revision).toEqual(snap4.revision)
                                        expect(shot.version).toEqual(snap4.version)
                                        expect(shot.data.mySnappi).toEqual(snap4.data.mySnappi)

                                        done()
                                    }
                                )
                            })

                            describe('and limit it with revMax', () => {
                                it('it should return the correct snapshot', function (done) {
                                    store.getSnapshot(
                                        {
                                            aggregateId: '920193847',
                                            aggregate: 'myCoolAggregate',
                                        },
                                        1,
                                        function (err, shot) {
                                            expect(err).not.toBeTruthy()
                                            expect(shot).not.toBeTruthy()

                                            done()
                                        }
                                    )
                                })
                            })

                            describe('and an other revMax', () => {
                                it('it should return the correct snapshot', function (done) {
                                    store.getSnapshot(
                                        {
                                            aggregateId: '920193847',
                                            aggregate: 'myCoolAggregate',
                                        },
                                        9,
                                        function (err, shot) {
                                            expect(err).not.toBeTruthy()
                                            expect(shot.id).toEqual(snap4.id)
                                            expect(shot.aggregateId).toEqual(snap4.aggregateId)
                                            expect(shot.aggregate).toEqual(snap4.aggregate)
                                            expect(shot.context).toEqual(snap4.context)
                                            expect(shot.commitStamp.getTime()).toEqual(
                                                snap4.commitStamp.getTime()
                                            )
                                            expect(shot.revision).toEqual(snap4.revision)
                                            expect(shot.version).toEqual(snap4.version)
                                            expect(shot.data.mySnappi).toEqual(snap4.data.mySnappi)

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('with an aggregateId and with an aggregate and with a context', () => {
                            it('it should return the correct snapshot', function (done) {
                                store.getSnapshot(
                                    {
                                        aggregateId: '938179341',
                                        aggregate: 'myCoolAggregate',
                                        context: 'myCoolContext',
                                    },
                                    -1,
                                    function (err, shot) {
                                        expect(err).not.toBeTruthy()
                                        expect(shot.id).toEqual(snap5.id)
                                        expect(shot.aggregateId).toEqual(snap5.aggregateId)
                                        expect(shot.aggregate).toEqual(snap5.aggregate)
                                        expect(shot.context).toEqual(snap5.context)
                                        expect(shot.commitStamp.getTime()).toEqual(
                                            snap5.commitStamp.getTime()
                                        )
                                        expect(shot.revision).toEqual(snap5.revision)
                                        expect(shot.version).toEqual(snap5.version)
                                        expect(shot.data.mySnappi).toEqual(snap5.data.mySnappi)

                                        done()
                                    }
                                )
                            })

                            describe('and limit it with revMax', () => {
                                it('it should return the correct snapshot', function (done) {
                                    store.getSnapshot(
                                        {
                                            aggregateId: '938179341',
                                            aggregate: 'myCoolAggregate',
                                            context: 'myCoolContext',
                                        },
                                        1,
                                        function (err, shot) {
                                            expect(err).not.toBeTruthy()
                                            expect(shot).not.toBeTruthy()

                                            done()
                                        }
                                    )
                                })
                            })

                            describe('and an other revMax', () => {
                                it('it should return the correct snapshot', function (done) {
                                    store.getSnapshot(
                                        {
                                            aggregateId: '938179341',
                                            aggregate: 'myCoolAggregate',
                                            context: 'myCoolContext',
                                        },
                                        2,
                                        function (err, shot) {
                                            expect(err).not.toBeTruthy()
                                            expect(shot.id).toEqual(snap5.id)
                                            expect(shot.aggregateId).toEqual(snap5.aggregateId)
                                            expect(shot.aggregate).toEqual(snap5.aggregate)
                                            expect(shot.context).toEqual(snap5.context)
                                            expect(shot.commitStamp.getTime()).toEqual(
                                                snap5.commitStamp.getTime()
                                            )
                                            expect(shot.revision).toEqual(snap5.revision)
                                            expect(shot.version).toEqual(snap5.version)
                                            expect(shot.data.mySnappi).toEqual(snap5.data.mySnappi)

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('with an aggregateId and without an aggregate but with a context', () => {
                            it('it should return the correct snapshot', function (done) {
                                store.getSnapshot(
                                    { aggregateId: '142351', context: 'conntttt' },
                                    -1,
                                    function (err, shot) {
                                        expect(err).not.toBeTruthy()
                                        expect(shot.id).toEqual(snap3.id)
                                        expect(shot.aggregateId).toEqual(snap3.aggregateId)
                                        expect(shot.aggregate).toEqual(snap3.aggregate)
                                        expect(shot.context).toEqual(snap3.context)
                                        expect(shot.commitStamp.getTime()).toEqual(
                                            snap3.commitStamp.getTime()
                                        )
                                        expect(shot.revision).toEqual(snap3.revision)
                                        expect(shot.version).toEqual(snap3.version)
                                        expect(shot.data.mySnappi).toEqual(snap3.data.mySnappi)

                                        done()
                                    }
                                )
                            })

                            describe('and limit it with revMax', () => {
                                it('it should return the correct snapshot', function (done) {
                                    store.getSnapshot(
                                        { aggregateId: '142351', context: 'conntttt' },
                                        1,
                                        function (err, shot) {
                                            expect(err).not.toBeTruthy()
                                            expect(shot).not.toBeTruthy()

                                            done()
                                        }
                                    )
                                })
                            })

                            describe('and an other revMax', () => {
                                it('it should return the correct snapshot', function (done) {
                                    store.getSnapshot(
                                        { aggregateId: '142351', context: 'conntttt' },
                                        5,
                                        function (err, shot) {
                                            expect(err).not.toBeTruthy()
                                            expect(shot.id).toEqual(snap3.id)
                                            expect(shot.aggregateId).toEqual(snap3.aggregateId)
                                            expect(shot.aggregate).toEqual(snap3.aggregate)
                                            expect(shot.context).toEqual(snap3.context)
                                            expect(shot.commitStamp.getTime()).toEqual(
                                                snap3.commitStamp.getTime()
                                            )
                                            expect(shot.revision).toEqual(snap3.revision)
                                            expect(shot.version).toEqual(snap3.version)
                                            expect(shot.data.mySnappi).toEqual(snap3.data.mySnappi)

                                            done()
                                        }
                                    )
                                })
                            })
                        })

                        describe('with a revision that already exists but with a newer version', () => {
                            it('it should return the correct snapshot', function (done) {
                                store.getSnapshot(
                                    {
                                        aggregateId: '920193847313131313',
                                        aggregate: 'myCoolAggregate2',
                                        context: 'myCoolContext',
                                    },
                                    -1,
                                    function (err, shot) {
                                        expect(err).not.toBeTruthy()
                                        expect(shot.id).toEqual(snap8.id)
                                        expect(shot.aggregateId).toEqual(snap8.aggregateId)
                                        expect(shot.aggregate).toEqual(snap8.aggregate)
                                        expect(shot.context).toEqual(snap8.context)
                                        expect(shot.commitStamp.getTime()).toEqual(
                                            snap8.commitStamp.getTime()
                                        )
                                        expect(shot.revision).toEqual(snap8.revision)
                                        expect(shot.version).toEqual(snap8.version)
                                        expect(shot.data.mySnappi).toEqual(snap8.data.mySnappi)

                                        done()
                                    }
                                )
                            })
                        })
                    })
                })

                describe('cleaning snapshots', () => {
                    describe('having some snapshots in the eventstore calling cleanSnapshot', () => {
                        var snap1 = {
                            id: 'rev3',
                            aggregateId: '920193847',
                            aggregate: 'myCoolAggregate',
                            context: 'myCoolContext',
                            commitStamp: new Date(Date.now() + 405),
                            revision: 3,
                            version: 1,
                            data: {
                                mySnappi: 'data',
                            },
                        }

                        var snap2 = {
                            id: 'rev4',
                            aggregateId: '920193847',
                            aggregate: 'myCoolAggregate',
                            context: 'myCoolContext',
                            commitStamp: new Date(Date.now() + 410),
                            revision: 4,
                            version: 1,
                            data: {
                                mySnappi: 'data2',
                            },
                        }

                        var snap3 = {
                            id: 'rev5',
                            aggregateId: '920193847',
                            aggregate: 'myCoolAggregate',
                            context: 'myCoolContext',
                            commitStamp: new Date(Date.now() + 420),
                            revision: 5,
                            version: 1,
                            data: {
                                mySnappi: 'data3',
                            },
                        }

                        var snap4 = {
                            id: 'rev9',
                            aggregateId: '920193847',
                            aggregate: 'myCoolAggregate',
                            context: 'myCoolContext',
                            commitStamp: new Date(Date.now() + 430),
                            revision: 9,
                            version: 1,
                            data: {
                                mySnappi: 'data4',
                            },
                        }

                        var snap5 = {
                            id: 'rev10',
                            aggregateId: '920193847',
                            aggregate: 'myCoolAggregate',
                            context: 'myCoolContext',
                            commitStamp: new Date(Date.now() + 440),
                            revision: 10,
                            version: 1,
                            data: {
                                mySnappi: 'dataXY',
                            },
                        }

                        var snap6 = {
                            id: 'rev12',
                            aggregateId: '920193847',
                            aggregate: 'myCoolAggregate',
                            context: 'myCoolContext',
                            commitStamp: new Date(Date.now() + 450),
                            revision: 12,
                            version: 1,
                            data: {
                                mySnappi: 'dataaaaa',
                            },
                        }

                        var snap7 = {
                            id: 'rev16',
                            aggregateId: '920193847',
                            aggregate: 'myCoolAggregate',
                            context: 'myCoolContext',
                            commitStamp: new Date(Date.now() + 555),
                            revision: 16,
                            version: 1,
                            data: {
                                mySnappi: 'dataaaaa2',
                            },
                        }

                        var snap8 = {
                            id: 'rev17',
                            aggregateId: '920193847',
                            aggregate: 'myCoolAggregate',
                            context: 'myCoolContext',
                            commitStamp: new Date(Date.now() + 575),
                            revision: 17,
                            version: 1,
                            data: {
                                mySnappi: 'dataaaaa3',
                            },
                        }

                        describe('with an aggregateId being used only in one context and aggregate', () => {
                            describe('having fewer snapshots than the threshold', () => {
                                beforeEach(function (done) {
                                    async.series(
                                        [
                                            function (callback) {
                                                store.addSnapshot(snap1, callback)
                                            },
                                            function (callback) {
                                                store.addSnapshot(snap2, callback)
                                            },
                                            function (callback) {
                                                store.addSnapshot(snap3, callback)
                                            },
                                            function (callback) {
                                                store.addSnapshot(snap4, callback)
                                            },
                                        ],
                                        done
                                    )
                                })

                                it('can be called without error', function (done) {
                                    store.cleanSnapshots(
                                        {
                                            aggregateId: '920193847',
                                            aggregate: 'myCoolAggregate',
                                            context: 'myCoolContext',
                                        },
                                        function (err, cleanedCount) {
                                            expect(err).not.toBeTruthy()
                                            expect(cleanedCount).toEqual(0)
                                            done()
                                        }
                                    )
                                })
                            })

                            describe('having more snapshots than the threshold', () => {
                                beforeEach(function (done) {
                                    async.series(
                                        [
                                            function (callback) {
                                                store.addSnapshot(snap1, callback)
                                            },
                                            function (callback) {
                                                store.addSnapshot(snap2, callback)
                                            },
                                            function (callback) {
                                                store.addSnapshot(snap3, callback)
                                            },
                                            function (callback) {
                                                store.addSnapshot(snap4, callback)
                                            },
                                            function (callback) {
                                                store.addSnapshot(snap5, callback)
                                            },
                                            function (callback) {
                                                store.addSnapshot(snap6, callback)
                                            },
                                            function (callback) {
                                                store.addSnapshot(snap7, callback)
                                            },
                                            function (callback) {
                                                store.addSnapshot(snap8, callback)
                                            },
                                        ],
                                        done
                                    )
                                })

                                it('it should clean oldest snapshots', function (done) {
                                    store.cleanSnapshots(
                                        {
                                            aggregateId: '920193847',
                                            aggregate: 'myCoolAggregate',
                                            context: 'myCoolContext',
                                        },
                                        function (err, cleanedCount) {
                                            expect(err).not.toBeTruthy()
                                            expect(cleanedCount).toEqual(3)
                                            done()
                                        }
                                    )
                                })
                            })
                        })
                    })
                })
            })
        })
    })
})
