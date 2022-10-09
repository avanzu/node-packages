const dotty = require('dotty'),
    { fromNullable, fromBoolean } = require('@avanzu/std').Result,
    { isArray } = require('./util'),
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

        mappings = fromNullable(mappings).unwrapOr({}) // || {}

        this.streamId = stream.aggregateId
        this.aggregateId = stream.aggregateId
        this.aggregate = stream.aggregate
        this.context = stream.context
        this.streamRevision = null
        this.commitId = null
        this.commitSequence = null
        this.commitStamp = null
        this.payload = event || null
        this.position = null

        this.applyMappings = () => {
            Object.keys(mappings).forEach(
                function (key) {
                    if (this[key] !== undefined && this[key] !== null) {
                        dotty.put(this.payload, mappings[key], this[key])
                    }
                }.bind(this)
            )
        }

        this.addToStream(stream)
        //eventstream.uncommittedEvents.push(this)
    }

    addToStream(eventstream) {
        eventstream.uncommittedEvents.push(this)
    }
}

module.exports = Event
