const debug = require('debug')('@avanzu/eventstore/tombstoneevent')
const Event = require('./event')
/**
 * Event constructor
 * @param {EventStream} eventstream the corresponding event stream object
 * @param {Object}      event       the event object
 * @constructor
 */
class TombstoneEvent extends Event {
    enterStream(eventstream) {
        debug('Adding tombstone event to eventstream')
        eventstream.eventsToDispatch.push(this)
    }
}

module.exports = TombstoneEvent
