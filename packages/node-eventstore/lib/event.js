const dotty = require('dotty'),
    { fromNullable, fromBoolean } = require('@avanzu/std').Result,
    { isArray, isNotNil } = require('./util'),
    { Messages } = require('./error')

const { NO_AGGREGATEID, NO_EVENT, NO_UNCOMMITTED, NO_STREAM } = Messages

/**
 * Event constructor
 * @param {EventStream} eventstream the corresponding event stream object
 * @param {Object}      event       the event object
 * @constructor
 */
class Event {
    constructor(stream, event, mappings) {
        fromNullable(stream, NO_STREAM)
            .chain(() => fromNullable(event, NO_EVENT))
            .chain(() => fromNullable(stream.aggregateId, NO_AGGREGATEID))
            .chain(() => fromBoolean(isArray(stream.uncommittedEvents), NO_UNCOMMITTED))
            .unwrap()

        this.streamId = stream.aggregateId
        this.aggregateId = stream.aggregateId
        this.aggregate = stream.aggregate
        this.context = stream.context
        this.streamRevision = null
        this.commitId = null
        this.commitSequence = null
        this.commitStamp = null
        this.payload = event
        this.position = null

        const mappingEntries = fromNullable(mappings).map(Object.entries).unwrapOr([])

        this.applyMappings = () =>
            mappingEntries
                .filter(([key]) => isNotNil(this[key]))
                .forEach(([key, value]) => dotty.put(this.payload, value, this[key]))

        this.enterStream(stream)
    }

    enterStream(stream) {
        stream.uncommittedEvents.push(this)
    }
}

module.exports = Event
