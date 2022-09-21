var debug = require('debug')('@avanzu/eventstore/eventstream'),
    _ = require('lodash'),
    Event = require('./event')

/**
 * EventStream constructor
 * The eventstream is one of the main objects to interagate with the eventstore.
 * @param {Object} eventstore the eventstore that should be injected
 * @param {Object} query the query object
 * @param {Array} events the events (from store)
 * @constructor
 */

class EventStream {
    constructor(eventstore, query, events) {
        if (!eventstore) {
            var errESMsg = 'eventstore not injected!'
            debug(errESMsg)
            throw new Error(errESMsg)
        }

        if (typeof eventstore.commit !== 'function') {
            var errESfnMsg = 'eventstore.commit not injected!'
            debug(errESfnMsg)
            throw new Error(errESfnMsg)
        }

        if (!query) {
            var errQryMsg = 'query not injected!'
            debug(errQryMsg)
            throw new Error(errQryMsg)
        }

        if (!query.aggregateId) {
            var errAggIdMsg = 'query.aggregateId not injected!'
            debug(errAggIdMsg)
            throw new Error(errAggIdMsg)
        }

        if (events) {
            if (!_.isArray(events)) {
                var errEvtsArrMsg = 'events should be an array!'
                debug(errEvtsArrMsg)
                throw new Error(errEvtsArrMsg)
            }

            for (var i = 0, len = events.length; i < len; i++) {
                var evt = events[i]
                if (evt.streamRevision === undefined || evt.streamRevision === null) {
                    var errEvtMsg = 'The events passed should all have a streamRevision!'
                    debug(errEvtMsg)
                    throw new Error(errEvtMsg)
                }
            }
        }

        this.eventstore = eventstore
        this.streamId = query.aggregateId
        this.aggregateId = query.aggregateId
        this.aggregate = query.aggregate
        this.context = query.context
        this.events = events || []
        this.uncommittedEvents = []
        this.lastRevision = -1

        this.events = _.sortBy(this.events, 'streamRevision')

        // to update lastRevision...
        this.currentRevision()
    }
    /**
     * This helper function calculates and returns the current stream revision.
     * @returns {Number} lastRevision
     */
    currentRevision() {
        for (var i = 0, len = this.events.length; i < len; i++) {
            if (this.events[i].streamRevision > this.lastRevision) {
                this.lastRevision = this.events[i].streamRevision
            }
        }

        return this.lastRevision
    }

    /**
     * adds an event to the uncommittedEvents array
     * @param {Object} event
     */
    addEvent(event) {
        new Event(this, event, this.eventstore.eventMappings)
    }

    /**
     * adds an array of events to the uncommittedEvents array
     * @param {Array} events
     */
    addEvents(events) {
        if (!_.isArray(events)) {
            var errEvtsArrMsg = 'events should be an array!'
            debug(errEvtsArrMsg)
            throw new Error(errEvtsArrMsg)
        }

        _.each(events, (evt) => {
            this.addEvent(evt)
        })
    }

    /**
     * commits all uncommittedEvents
     * @param {Function} callback the function that will be called when this action has finished [optional]
     */
    commit(callback = () => {}) {
        return new Promise((Ok, Err) => {
            this.eventstore
                .commit(this)
                .then((res) => {
                    callback(null, res)
                    Ok(res)
                })
                .catch((err) => {
                    callback(err)
                    Err(err)
                })
        })
    }
}

module.exports = EventStream
