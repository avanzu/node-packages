const Event = require('../lib/event')
const { Messages } = require('../lib/error')

describe('Event', () => {
    describe('creating an instance', () => {
        it('without passing an eventstream it should throw an error', () => {
            expect(() => {
                new Event()
            }).toThrowError(Messages.NO_STREAM)
        })

        it('without passing an event it should throw an error', () => {
            expect(() => {
                new Event({})
            }).toThrowError(Messages.NO_EVENT)
        })

        it('without passing an aggregateId in the eventstream it should throw an error', () => {
            expect(() => {
                new Event({}, {})
            }).toThrowError(Messages.NO_AGGREGATEID)
        })

        it('without passing in the eventstream with its uncommittedEvents property it should throw an error', () => {
            expect(() => {
                new Event({ aggregateId: 'myAggId' }, {})
            }).toThrowError(Messages.NO_UNCOMMITTED)
        })

        it('passing all needed values it should return a valid object', () => {
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

        it('passing all values it should return a valid object', () => {
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
