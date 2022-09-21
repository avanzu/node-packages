const eventstore = require('..')
const StoreEventEmitter = require('../lib/storeEventEmitter')

function beforeEachMethod(eventName) {
    var self = this

    self.es.on('before-' + eventName, function (result) {
        self.receivedBeforeResult = result
        self.receivedBefore = true
    })

    self.es.on('after-' + eventName, function (result) {
        self.receivedAfter = true
        self.receivedAfterResult = result
    })
}

function resetCheckValues() {
    this.receivedBefore = false
    this.receivedAfter = false
    this.receivedBeforeResult = undefined
    this.receivedAfterResult = undefined
}

function expectEventsEmitted() {
    expect(this.receivedBefore).toEqual(true)
    expect(this.receivedAfter).toEqual(true)
    expect(this.receivedBeforeResult).toBeInstanceOf(Object)
    expect(this.receivedAfterResult).toBeInstanceOf(Object)
    expect(this.receivedBeforeResult.milliseconds).toBeGreaterThanOrEqual(0)
    expect(this.receivedAfterResult.milliseconds).toBeGreaterThanOrEqual(0)
}

function expectEventsNotEmitted() {
    expect(this.receivedBefore).toEqual(false)
    expect(this.receivedAfter).toEqual(false)
    expect(this.receivedBeforeResult).toEqual(undefined)
    expect(this.receivedAfterResult).toEqual(undefined)
}

describe('StoreEventEmitter', () => {
    describe('create instance', () => {
        it('it should throw an error if instantiated without eventstore', () => {
            expect(() => {
                new StoreEventEmitter()
            }).toThrowError()
        })

        it('it should be instance of StoreEventEmitter', () => {
            var storeEventEmitter = new StoreEventEmitter(eventstore())
            expect(storeEventEmitter).toBeInstanceOf(StoreEventEmitter)
        })

        it('addEventEmitter should be a function', () => {
            var storeEventEmitter = new StoreEventEmitter(eventstore())
            expect(storeEventEmitter.addEventEmitter).toBeInstanceOf(Function)
        })
    })

    describe('emit store events is disabled by default', () => {
        var self = this

        beforeEach(() => {
            self.es = eventstore()
            resetCheckValues.call(self)
        })

        afterEach(() => {
            self.es.removeAllListeners()
        })

        it('it should not emit any events', function (done) {
            self.es.store.addEvents([], () => {
                expectEventsNotEmitted.call(self)
                done()
            })
        })
    })

    describe('calling that method', () => {
        var self = this

        beforeEach(() => {
            self.es = eventstore({ emitStoreEvents: true })
            resetCheckValues.call(self)
        })

        afterEach(() => {
            self.es.removeAllListeners()
        })

        describe('clear', () => {
            beforeEach(beforeEachMethod.bind(self, 'clear'))

            it('it should emit the correct events', function (done) {
                self.es.store.clear(() => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })
        })

        describe('getNextPositions', () => {
            beforeEach(beforeEachMethod.bind(self, 'get-next-positions'))

            it('it should emit the correct events', function (done) {
                self.es.store.getNextPositions(4, () => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })
        })

        describe('addEvents', () => {
            beforeEach(beforeEachMethod.bind(self, 'add-events'))

            it('it should emit the correct events with valid parameters', function (done) {
                self.es.store.addEvents([{ one: 'event1' }], () => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })

            it('it should emit the correct events with empty events array', function (done) {
                self.es.store.addEvents([], () => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })
        })

        describe('getEvents', () => {
            beforeEach(beforeEachMethod.bind(self, 'get-events'))

            it('it should emit the correct events with all parameters', function (done) {
                self.es.getEvents(
                    { aggregateId: 'myAggId', aggregate: 'myAgg', context: 'myCont' },
                    2,
                    32,
                    () => {
                        expectEventsEmitted.call(self)
                        done()
                    }
                )
            })

            it('it should emit the correct events with only callback parameter', function (done) {
                self.es.getEvents(() => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })

            it('it should emit the correct events with callback instead of skip parameter', function (done) {
                self.es.getEvents(
                    { aggregateId: 'myAggId', aggregate: 'myAgg', context: 'myCont' },
                    () => {
                        expectEventsEmitted.call(self)
                        done()
                    }
                )
            })

            it('it should emit the correct events with callback instead of limit parameter', function (done) {
                self.es.getEvents(
                    { aggregateId: 'myAggId', aggregate: 'myAgg', context: 'myCont' },
                    2,
                    () => {
                        expectEventsEmitted.call(self)
                        done()
                    }
                )
            })
        })

        describe('getEventsSince', () => {
            beforeEach(beforeEachMethod.bind(self, 'get-events-since'))

            it('it should emit the correct events with all parameters', function (done) {
                self.es.getEventsSince(new Date(2000, 1, 1), 0, 3, () => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })

            it('it should emit the correct events with callback instead of skip parameter', function (done) {
                self.es.getEventsSince(new Date(2000, 1, 1), () => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })

            it('it should emit the correct events with callback instead of limit parameter', function (done) {
                self.es.getEventsSince(new Date(2000, 1, 1), 0, () => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })
        })

        describe('getEventsByRevision', () => {
            beforeEach(beforeEachMethod.bind(self, 'get-events-by-revision'))

            it('it should emit the correct events with all parameters', function (done) {
                self.es.getEventsByRevision('myQuery', 3, 100, () => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })

            it('it should emit the correct events with callback instead of revMin parameter', function (done) {
                self.es.getEventsByRevision('myQuery', () => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })

            it('it should emit the correct events with callback instead of revMax parameter', function (done) {
                self.es.getEventsByRevision('myQuery', 3, () => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })
        })

        describe('getLastEvent', () => {
            beforeEach(beforeEachMethod.bind(self, 'get-last-event'))

            it('it should emit the correct events with all parameters', function (done) {
                self.es.getLastEvent('myQuery', () => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })
        })

        describe.skip('getUndispatchedEvents', () => {
            beforeEach(beforeEachMethod.bind(self, 'get-undispatched-events'))

            it('it should emit the correct events with all parameters', async () => {
                await self.es.getUndispatchedEvents('myQuery')
                expectEventsEmitted.call(self)
            })

            it('it should emit the correct events with only callback parameter', async () => {
                await self.es.getUndispatchedEvents()
                expectEventsEmitted.call(self)
            })
        })

        describe.skip('setEventToDispatched', () => {
            beforeEach(() => {
                beforeEachMethod.call(self, 'set-event-to-dispatched')

                self.es.store.setEventToDispatched = function (_id, callback) {
                    return callback()
                }

                var storeEventEmitter = new StoreEventEmitter(self.es)
                storeEventEmitter.addEventEmitter()
            })

            it('it should emit the correct events with all parameters', function (done) {
                self.es.setEventToDispatched('my-id', () => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })
        })

        describe('addSnapshot', () => {
            beforeEach(beforeEachMethod.bind(self, 'add-snapshot'))

            it('it should emit the correct events with all parameters', function (done) {
                self.es.store.addSnapshot('myAggId', () => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })
        })

        describe('cleanSnapshots', () => {
            beforeEach(beforeEachMethod.bind(self, 'clean-snapshots'))

            it('it should emit the correct events with all parameters', function (done) {
                self.es.store.cleanSnapshots('myQuery', () => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })
        })

        describe('getSnapshot', () => {
            beforeEach(beforeEachMethod.bind(self, 'get-snapshot'))

            it('it should emit the correct events', function (done) {
                self.es.store.getSnapshot('myQuery', 100, () => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })
        })

        describe('getEventStream', () => {
            beforeEach(beforeEachMethod.bind(self, 'get-event-stream'))

            it('it should emit the correct events with all parameters', function (done) {
                self.es.getEventStream('myQuery', 3, 100, () => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })

            it('it should emit the correct events with callback instead of revMin parameter', function (done) {
                self.es.getEventStream('myQuery', () => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })

            it('it should emit the correct events with callback instead of revMax parameter', function (done) {
                self.es.getEventStream('myQuery', 3, () => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })
        })

        describe('getFromSnapshot', () => {
            beforeEach(beforeEachMethod.bind(self, 'get-from-snapshot'))

            it('it should emit the correct events with all parameters', function (done) {
                self.es.getFromSnapshot('myQuery', 100, () => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })

            it('it should emit the correct events with callback instead of revMax parameter', function (done) {
                self.es.getFromSnapshot('myQuery', () => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })
        })

        describe('createSnapshot', () => {
            beforeEach(beforeEachMethod.bind(self, 'create-snapshot'))

            it('it should emit the correct events with all parameters', function (done) {
                self.es.createSnapshot({ aggregateId: 'myAggId' }, () => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })
        })

        describe('commit', () => {
            beforeEach(() => {
                beforeEachMethod.call(self, 'commit')

                self.es.commit = function (_eventstream, callback) {
                    return callback()
                }

                var storeEventEmitter = new StoreEventEmitter(self.es)
                storeEventEmitter.addEventEmitter()
            })

            it('it should emit the correct events with all parameters', function (done) {
                self.es.commit({}, () => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })
        })

        describe('getLastEventAsStream', () => {
            beforeEach(beforeEachMethod.bind(self, 'get-last-event-as-stream'))

            it('it should emit the correct events with all parameters', function (done) {
                self.es.getLastEventAsStream({ aggregateId: 'myAggId' }, () => {
                    expectEventsEmitted.call(self)
                    done()
                })
            })
        })
    })
})
