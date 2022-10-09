const Event = require('../lib/event')
const { Messages } = require('../lib/error')

describe('Event', () => {
    describe('creating an instance', () => {
        describe('without passing an eventstream', () => {
            it('it should throw an error', () => {
                expect(() => {
                    new Event()
                }).toThrowError(Messages.NO_STREAM)
            })
        })

        describe('without passing an event', () => {
            it('it should throw an error', () => {
                expect(() => {
                    new Event({})
                }).toThrowError(Messages.NO_EVENT)
            })
        })

        describe('without passing an aggregateId in the eventstream', () => {
            it('it should throw an error', () => {
                expect(() => {
                    new Event({}, {})
                }).toThrowError(Messages.NO_AGGREGATEID)
            })
        })

        describe('without passing in the eventstream with its uncommittedEvents property', () => {
            it('it should throw an error', () => {
                expect(() => {
                    new Event({ aggregateId: 'myAggId' }, {})
                }).toThrowError(Messages.NO_UNCOMMITTED)
            })
        })

        describe('passing all needed values', () => {
            it('it should return a valid object', () => {
                var uncommitedEvents = []
                var evt = null

                expect(() => {
                    evt = new Event(
                        { aggregateId: 'myAggId', uncommittedEvents: uncommitedEvents },
                        { data: 'event' }
                    )
                }).not.toThrowError()

                expect(evt.aggregateId).toEqual('myAggId')
                expect(evt.streamId).toEqual('myAggId')
                expect(evt.payload.data).toEqual('event')
                expect(uncommitedEvents.length).toEqual(1)
                expect(uncommitedEvents[0]).toEqual(evt)
            })
        })

        describe('passing all values', () => {
            it('it should return a valid object', () => {
                var uncommitedEvents = []
                var evt = null

                expect(() => {
                    evt = new Event(
                        {
                            aggregateId: 'myAggId',
                            uncommittedEvents: uncommitedEvents,
                            aggregate: 'myAgg',
                            context: 'myCont',
                        },
                        { data: 'event' }
                    )
                }).not.toThrowError()

                expect(evt.aggregateId).toEqual('myAggId')
                expect(evt.streamId).toEqual('myAggId')
                expect(evt.payload.data).toEqual('event')
                expect(evt.aggregate).toEqual('myAgg')
                expect(evt.context).toEqual('myCont')
                expect(uncommitedEvents.length).toEqual(1)
                expect(uncommitedEvents[0]).toEqual(evt)
            })
        })
    })
})
