const EventStream = require('../lib/eventStream')
const { Messages } = require('../lib/error')
describe('EventStream', () => {
    describe('creating an instance', () => {
        describe('without passing an eventstore', () => {
            it('it should throw an error', () => {
                expect(() => new EventStream()).toThrowError(Messages.NO_STORE)
                expect(() => new EventStream({})).toThrowError(Messages.COMMIT_UNCALLABLE)
            })
        })

        describe('without passing a query object', () => {
            it('it should throw an error', () => {
                expect(() => {
                    new EventStream({ commit: () => {} })
                }).toThrowError(Messages.NO_QUERY)
            })
        })

        describe('without passing an aggregateId in the query object', () => {
            it('it should throw an error', () => {
                expect(() => {
                    new EventStream({ commit: () => {} }, {})
                }).toThrowError(Messages.NO_AGGREGATEID)
            })
        })

        describe('without passing an aggregateId in the query object', () => {
            it('it should throw an error', () => {
                expect(() => {
                    new EventStream({ commit: () => {} }, { aggregateId: 'myAggId' }, [
                        { streamRevision: 0 },
                        {},
                    ])
                }).toThrowError(Messages.EVENTS_MISSING_REV)
            })
        })

        describe('passing all needed values', () => {
            it('it should return a valid object', () => {
                function commit() {}
                var stream = null

                expect(() => {
                    stream = new EventStream({ commit: commit }, { aggregateId: 'myAggId' })
                }).not.toThrowError()

                expect(stream.eventstore.commit).toEqual(commit)
                expect(stream.aggregateId).toEqual('myAggId')
                expect(stream.streamId).toEqual('myAggId')
                expect(stream.events).toBeInstanceOf(Array)
                expect(stream.events.length).toEqual(0)
                expect(stream.uncommittedEvents).toBeInstanceOf(Array)
                expect(stream.uncommittedEvents.length).toEqual(0)
                expect(stream.lastRevision).toEqual(-1)
                expect(stream.eventstore.commit).toEqual(commit)
            })
        })

        describe('passing all values', () => {
            it('it should return a valid object', () => {
                function commit() {}
                var stream = null

                expect(() => {
                    stream = new EventStream(
                        { commit: commit },
                        { aggregateId: 'myAggId', aggregate: 'myAgg', context: 'myCont' },
                        [{ one: 'event', streamRevision: 5 }]
                    )
                }).not.toThrowError()

                expect(stream.eventstore.commit).toEqual(commit)
                expect(stream.aggregateId).toEqual('myAggId')
                expect(stream.streamId).toEqual('myAggId')
                expect(stream.aggregate).toEqual('myAgg')
                expect(stream.context).toEqual('myCont')
                expect(stream.events).toBeInstanceOf(Array)
                expect(stream.events.length).toEqual(1)
                expect(stream.events[0].one).toEqual('event')
                expect(stream.uncommittedEvents).toBeInstanceOf(Array)
                expect(stream.uncommittedEvents.length).toEqual(0)
                expect(stream.lastRevision).toEqual(5)
                expect(stream.eventstore.commit).toEqual(commit)
            })
        })

        describe('with some events', () => {
            function commit() {}
            var evts = [
                { one: 'event', streamRevision: 0 },
                { one: 'three', streamRevision: 2 },
                { one: 'two', streamRevision: 1 },
            ]

            it('it should return a valid object', () => {
                var stream = new EventStream(
                    { commit: commit },
                    { aggregateId: 'myAggId', aggregate: 'myAgg', context: 'myCont' },
                    evts
                )

                expect(stream.lastRevision).toEqual(2)
                expect(stream.events).toBeInstanceOf(Array)
                expect(stream.events.length).toEqual(3)
                expect(stream.events[0]).toEqual(evts[0])
                expect(stream.events[1]).toEqual(evts[2])
                expect(stream.events[2]).toEqual(evts[1])
            })

            describe('calling currentRevision', () => {
                it('it should return the correct revision', () => {
                    var stream = new EventStream(
                        { commit: commit },
                        { aggregateId: 'myAggId', aggregate: 'myAgg', context: 'myCont' },
                        evts
                    )

                    expect(stream.lastRevision).toEqual(2)
                    expect(stream.currentRevision()).toEqual(2)
                    expect(stream.lastRevision).toEqual(2)
                })
            })

            describe('calling addEvent', () => {
                var stream

                beforeEach(() => {
                    stream = new EventStream(
                        { commit: commit },
                        { aggregateId: 'myAggId', aggregate: 'myAgg', context: 'myCont' },
                        evts
                    )
                })

                it('it should add the passed event to the uncommitted event array', () => {
                    stream.addEvent({ new: 'event' })

                    expect(stream.events.length).toEqual(3)
                    expect(stream.uncommittedEvents.length).toEqual(1)
                    expect(stream.uncommittedEvents[0].payload['new']).toEqual('event')
                })
            })

            describe('calling addEvents', () => {
                var stream

                beforeEach(() => {
                    stream = new EventStream(
                        { commit: commit },
                        { aggregateId: 'myAggId', aggregate: 'myAgg', context: 'myCont' },
                        evts
                    )
                })

                it('it should add the passed events to the uncommitted event array', () => {
                    stream.addEvents([{ new1: 'event1' }, { new2: 'event2' }])

                    expect(stream.events.length).toEqual(3)
                    expect(stream.uncommittedEvents.length).toEqual(2)
                    expect(stream.uncommittedEvents[0].payload['new1']).toEqual('event1')
                    expect(stream.uncommittedEvents[1].payload['new2']).toEqual('event2')
                })

                describe('with a non array', () => {
                    it('it should add the passed events to the uncommitted event array', () => {
                        expect(() => {
                            stream.addEvents({})
                        }).toThrowError(/array/)
                    })
                })
            })

            describe('calling commit', () => {
                it('it should add the passed events to the uncommitted event array', async () => {
                    const commitCheck = jest.fn().mockResolvedValue()
                    const stream = new EventStream(
                        { commit: commitCheck },
                        { aggregateId: 'myAggId', aggregate: 'myAgg', context: 'myCont' },
                        evts
                    )

                    stream.addEvents([{ new1: 'event1' }, { new2: 'event2' }])

                    await stream.commit()
                    expect(commitCheck).toHaveBeenCalledWith(stream)
                })
            })
        })
    })
})
