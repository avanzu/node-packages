const EventDispatcher = require('../lib/eventDispatcher')

describe('EventDispatcher', () => {
    describe('creating an instance', () => {
        describe('without passing a publisher function', () => {
            describe('and calling start', () => {
                it('it should callback with an error', function (done) {
                    var eventDispatcher = new EventDispatcher()
                    eventDispatcher.start(function (err) {
                        expect(err).toBeTruthy()
                        expect(err.message).toMatch(/publisher/)
                        done()
                    })
                })
            })
        })

        describe('without passing a store', () => {
            describe('and calling start', () => {
                it('it should callback with an error', function (done) {
                    var eventDispatcher = new EventDispatcher(() => {}, {
                        getUndispatchedEvents: () => {},
                    })
                    expect(eventDispatcher.undispatchedEventsQueue.length).toEqual(0)
                    eventDispatcher.start(function (err) {
                        expect(err).toBeTruthy()
                        expect(err.message).toMatch(/store/)
                        done()
                    })
                })
            })
        })
    })

    describe('starting it', () => {
        describe('while having some undispatched events in the store', () => {
            it('it should publish that events', function (done) {
                var eventsInStore = [
                    {
                        payload: {
                            one: 'event1',
                        },
                    },
                    {
                        payload: {
                            two: 'event2',
                        },
                    },
                ]

                function getUndispatchedEvents(callback) {
                    callback(null, eventsInStore)
                }

                var publishedEvents = []

                function publisher(evt) {
                    publishedEvents.push(evt)
                    check()
                }

                function check() {
                    if (publishedEvents.length === 2) {
                        expect(publishedEvents[0]).toEqual(eventsInStore[0].payload)
                        expect(publishedEvents[1]).toEqual(eventsInStore[1].payload)
                        done()
                    }
                }

                var eventDispatcher = new EventDispatcher(publisher, {
                    getUndispatchedEvents: getUndispatchedEvents,
                    setEventToDispatched: function (evt, callback) {
                        callback(null)
                    },
                })
                expect(eventDispatcher.undispatchedEventsQueue.length).toEqual(0)

                eventDispatcher.start(function (err) {
                    expect(err).not.toBeTruthy()
                })
            })

            it('should not crash when there are lots of pending events', function (done) {
                var eventsInStore = []

                for (var i = 0; i < 10000; i++) {
                    eventsInStore.push({
                        payload: {
                            index: i,
                        },
                    })
                }

                function getUndispatchedEvents(callback) {
                    callback(null, eventsInStore)
                }

                var publishedEvents = []

                function publisher(evt) {
                    publishedEvents.push(evt)
                    check()
                }

                function check() {
                    if (publishedEvents.length === eventsInStore.length) {
                        done()
                    }
                }

                var eventDispatcher = new EventDispatcher(publisher, {
                    getUndispatchedEvents: getUndispatchedEvents,
                    setEventToDispatched: function (evt, callback) {
                        callback(null)
                    },
                })
                expect(eventDispatcher.undispatchedEventsQueue.length).toEqual(0)

                eventDispatcher.start(function (err) {
                    expect(err).not.toBeTruthy()
                })
            })
        })

        describe('and calling addUndispatchedEvents', () => {
            it('it should publish that events', function (done) {
                var eventsInStore = []

                var eventsToBePublished = [
                    {
                        payload: {
                            one: 'event1',
                        },
                    },
                    {
                        payload: {
                            two: 'event2',
                        },
                    },
                ]

                function getUndispatchedEvents(callback) {
                    callback(null, eventsInStore)
                }

                var publishedEvents = []

                function publisher(evt) {
                    publishedEvents.push(evt)
                    check()
                }

                function check() {
                    if (publishedEvents.length === 2) {
                        expect(publishedEvents[0]).toEqual(eventsToBePublished[0].payload)
                        expect(publishedEvents[1]).toEqual(eventsToBePublished[1].payload)
                        done()
                    }
                }

                var eventDispatcher = new EventDispatcher(publisher, {
                    getUndispatchedEvents: getUndispatchedEvents,
                    setEventToDispatched: function (evt, callback) {
                        callback(null)
                    },
                })
                expect(eventDispatcher.undispatchedEventsQueue.length).toEqual(0)

                eventDispatcher.start(function (err) {
                    expect(err).not.toBeTruthy()
                })

                eventDispatcher.addUndispatchedEvents(eventsToBePublished)
            })
        })
    })
})
