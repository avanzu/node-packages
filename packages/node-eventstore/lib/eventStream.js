const Event = require('./event'),
    TombstoneEvent = require('./tombstoneEvent'),
    { fromNullable, fromBoolean } = require('@avanzu/std').Result,
    { isNotNil, isCallable, isArray } = require('./util'),
    { all, pipe, prop, sortBy, max } = require('ramda'),
    { Messages } = require('./error')

const {
    NO_STORE,
    COMMIT_UNCALLABLE,
    NO_QUERY,
    NO_AGGREGATEID,
    EVENTS_NO_ARRAY,
    EVENTS_MISSING_REV,
} = Messages

const hasRev = pipe(prop('streamRevision'), isNotNil)

/**
 * EventStream constructor
 * The eventstream is one of the main objects to interagate with the eventstore.
 * @param {Object} eventstore the eventstore that should be injected
 * @param {Object} query the query object
 * @param {Array} events the events (from store)
 * @constructor
 */

class EventStream {
    constructor(store, query, events = []) {
        fromNullable(store, NO_STORE)
            .chain(() => fromBoolean(isCallable(store.commit), COMMIT_UNCALLABLE))
            .chain(() => fromNullable(query, NO_QUERY))
            .chain(() => fromNullable(query.aggregateId, NO_AGGREGATEID))
            .chain(() => fromBoolean(isArray(events), EVENTS_NO_ARRAY))
            .chain(() => fromBoolean(all(hasRev, events), EVENTS_MISSING_REV))
            .unwrap()

        this.eventstore = store
        this.streamId = query.aggregateId
        this.aggregateId = query.aggregateId
        this.aggregate = query.aggregate
        this.context = query.context
        this.uncommittedEvents = []
        this.eventsToDispatch = []
        this.lastRevision = -1

        this.events = sortBy(prop('streamRevision'), events)

        // to update lastRevision...
        this.currentRevision()
    }

    get eventMappings() {
        return this.eventstore.eventMappings
    }

    /**
     * This helper function calculates and returns the current stream revision.
     * @returns {Number} lastRevision
     */
    currentRevision() {
        this.lastRevision = this.events.reduce((cur, x) => max(cur, x.streamRevision), -1)
        return this.lastRevision
    }

    /**
     * adds an event to the uncommittedEvents array
     * @param {Object} event
     */
    addEvent(event) {
        new Event(this, event, this.eventMappings)
        return this
    }

    addTombstoneEvent() {
        new TombstoneEvent(this, this, this.eventMappings)
        return this
    }

    /**
     * adds an array of events to the uncommittedEvents array
     * @param {Array} events
     */
    addEvents(events) {
        fromBoolean(isArray(events), EVENTS_NO_ARRAY).unwrap()
        events.forEach((e) => this.addEvent(e))

        return this
    }

    /**
     * commits all uncommittedEvents
     * @param {Function} callback the function that will be called when this action has finished [optional]
     */
    commit() {
        return this.eventstore.commit(this)
    }
}

module.exports = EventStream
