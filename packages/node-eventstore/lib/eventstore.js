var debug = require('debug')('@avanzu/eventstore/eventstore'),
    EventEmitter = require('events').EventEmitter,
    _ = require('lodash'),
    //    async = require('async'),
    // tolerate = require('tolerance'),
    EventDispatcher = require('./eventDispatcher'),
    EventStream = require('./eventStream'),
    Snapshot = require('./snapshot')

const noop = () => {}

class Eventstore extends EventEmitter {
    constructor(options, store) {
        super(options)
        this.options = options || {}
        this.store = store
        this.eventMappings = {}
    }
    /**
     * Inject function for event publishing.
     * @param {Function} fn the function to be injected
     * @returns {Eventstore}  to be able to chain...
     */
    useEventPublisher(fn) {
        if (fn.length === 1) {
            fn = _.wrap(fn, (func, evt, callback) => {
                func(evt)
                callback(null)
            })
        }

        this.publisher = fn

        return this
    }

    /**
     * Define which values should be mapped/copied to the payload event. [optional]
     * @param {Object} mappings the mappings in dotty notation
     *                          {
     *                            id: 'id',
     *                            commitId: 'commitId',
     *                            commitSequence: 'commitSequence',
     *                            commitStamp: 'commitStamp',
     *                            streamRevision: 'streamRevision'
     *                          }
     * @returns {Eventstore}  to be able to chain...
     */
    defineEventMappings(mappings) {
        if (!mappings || !_.isObject(mappings)) {
            var err = new Error('Please pass a valid mapping values!')
            debug(err)
            throw err
        }

        this.eventMappings = mappings

        return this
    }

    /**
     * Call this function to initialize the eventstore.
     * If an event publisher function was injected it will additionally initialize an event dispatcher.
     * @param {Function} callback the function that will be called when this action has finished [optional]
     */
    init() {
        return new Promise((Ok, Err) => {
            this.store.on('connect', () => (debug('store up'), this.emit('connect')))
            this.store.on('disconnect', () => (debug('store down'), this.emit('disconnect')))

            const initDispatcher = () => {
                if (!this.publisher) {
                    debug('no publisher defined')
                    return this
                }

                debug('init event dispatcher')
                this.dispatcher = new EventDispatcher(this.publisher, this)
                this.dispatcher.start()
            }

            this.store
                .connect()
                .then(initDispatcher)
                .then(() => this)
                .then(Ok, Err)
            /*
            tolerate(
                (callback) => this.store.connect().then(() => callback()),
                this.options.timeout || 0,
                (err) => {
                    if (err) {
                        debug(err)
                        if (callback) callback(err)
                        Err(err)
                        return
                    }
                    if (!this.publisher) {
                        debug('no publisher defined')
                        if (callback) callback(null)
                        Ok(this)
                        return
                    }
                    debug('init event dispatcher')
                    this.dispatcher = new EventDispatcher(this.publisher, this)
                    this.dispatcher.start(() => {
                        callback(null, this)
                        Ok(this)
                    })
                }
            )
            */
        })
    }

    // streaming api

    /**
     * streams the events
     * @param {Object || String} query    the query object [optional]
     * @param {Number}           skip     how many events should be skipped? [optional]
     * @param {Number}           limit    how many events do you want in the result? [optional]
     * @returns {Stream} a stream with the events
     */
    streamEvents(query, skip, limit) {
        if (!this.store.streamable)
            throw new Error(
                'Streaming API is not suppoted by ' +
                    (this.options.type || 'inmemory') +
                    ' db implementation.'
            )

        if (typeof query === 'number') {
            limit = skip
            skip = query
            query = {}
        }

        if (typeof query === 'string') {
            query = { aggregateId: query }
        }

        return this.store.streamEvents(query, skip, limit)
    }

    /**
     * streams all the events since passed commitStamp
     * @param {Date}     commitStamp the date object
     * @param {Number}   skip        how many events should be skipped? [optional]
     * @param {Number}   limit       how many events do you want in the result? [optional]
     * @returns {Stream} a stream with the events
     */
    streamEventsSince(commitStamp, skip, limit) {
        if (!this.store.streamable)
            throw new Error(
                'Streaming API is not suppoted by ' +
                    (this.options.type || 'inmemory') +
                    ' db implementation.'
            )

        if (!commitStamp) {
            var err = new Error('Please pass in a date object!')
            debug(err)
            throw err
        }

        commitStamp = new Date(commitStamp)

        return this.store.streamEventsSince(commitStamp, skip, limit)
    }

    /**
     * stream events by revision
     * @param {Object || String} query    the query object
     * @param {Number}           revMin   revision start point [optional]
     * @param {Number}           revMax   revision end point (hint: -1 = to end) [optional]
     * @returns {Stream} a stream with the events
     */
    streamEventsByRevision(query, revMin, revMax) {
        if (typeof query === 'string') {
            query = { aggregateId: query }
        }

        if (!query.aggregateId) {
            var err = new Error('An aggregateId should be passed!')
            debug(err)
            // FIXME: where is the callback supposed to come from?
            // if (callback) callback(err)
            return
        }

        return this.store.streamEventsByRevision(query, revMin, revMax)
    }

    /**
     * loads the events
     * @param {Object || String} query    the query object [optional]
     * @param {Number}           skip     how many events should be skipped? [optional]
     * @param {Number}           limit    how many events do you want in the result? [optional]
     * @param {Function}         callback the function that will be called when this action has finished
     *                                    `function(err, events){}`
     */
    getEvents(query = noop, skip = noop, limit = noop) {
        return new Promise((Ok, Err) => {
            if (typeof query === 'function') {
                skip = 0
                limit = -1
                query = {}
            } else if (typeof skip === 'function') {
                skip = 0
                limit = -1
                if (typeof query === 'number') {
                    skip = query
                    query = {}
                }
            } else if (typeof limit === 'function') {
                limit = -1
                if (typeof query === 'number') {
                    limit = skip
                    skip = query
                    query = {}
                }
            }
            if (typeof query === 'string') {
                query = { aggregateId: query }
            }

            const nextFn = () => this.getEvents(query, skip + limit, limit)

            return this.store
                .getEvents(query, skip, limit)
                .then((res) => Object.assign(res || {}, { next: nextFn }))
                .then(Ok, Err)
        })
    }

    /**
     * loads all the events since passed commitStamp
     * @param {Date}     commitStamp the date object
     * @param {Number}   skip        how many events should be skipped? [optional]
     * @param {Number}   limit       how many events do you want in the result? [optional]
     * @param {Function} callback    the function that will be called when this action has finished
     *                               `function(err, events){}`
     */
    getEventsSince(commitStamp, skip = noop, limit = noop) {
        return new Promise((Ok, Err) => {
            if (!commitStamp) {
                var err = new Error('Please pass in a date object!')
                debug(err)
                throw err
            }

            if (typeof skip === 'function') {
                skip = 0
                limit = -1
            } else if (typeof limit === 'function') {
                limit = -1
            }

            const nextFn = () => this.getEventsSince(new Date(commitStamp), skip + limit, limit)

            return this.store
                .getEventsSince(new Date(commitStamp), skip, limit)
                .then((res) => Object.assign(res || {}, { next: nextFn }))
                .then(Ok, Err)
        })
    }

    /**
     * loads the events
     * @param {Object || String} query    the query object
     * @param {Number}           revMin   revision start point [optional]
     * @param {Number}           revMax   revision end point (hint: -1 = to end) [optional]
     * @param {Function}         callback the function that will be called when this action has finished
     *                                    `function(err, events){}`
     */
    getEventsByRevision(query, revMin = noop, revMax = noop) {
        return new Promise((Ok, Err) => {
            if (typeof revMin === 'function') {
                revMin = 0
                revMax = -1
            } else if (typeof revMax === 'function') {
                revMax = -1
            }

            if (typeof query === 'string') {
                query = { aggregateId: query }
            }

            if (!query.aggregateId) {
                var err = new Error('An aggregateId should be passed!')
                debug(err)
                return Err(err)
            }

            this.store.getEventsByRevision(query, revMin, revMax).then(Ok, Err)
        })
    }

    /**
     * loads the event stream
     * @param {Object || String} query    the query object
     * @param {Number}           revMin   revision start point [optional]
     * @param {Number}           revMax   revision end point (hint: -1 = to end) [optional]
     * @param {Function}         callback the function that will be called when this action has finished
     *                                    `function(err, eventstream){}`
     */
    getEventStream(query, revMin, revMax) {
        return new Promise((Ok, Err) => {
            if (typeof revMin === 'function') {
                revMin = 0
                revMax = -1
            } else if (typeof revMax === 'function') {
                revMax = -1
            }

            if (typeof query === 'string') {
                query = { aggregateId: query }
            }

            if (!query.aggregateId) {
                var err = new Error('An aggregateId should be passed!')
                debug(err)
                return Err(err)
            }

            this.getEventsByRevision(query, revMin, revMax)
                .then((evts) => new EventStream(this, query, evts))
                .then(Ok, Err)
        })
    }

    /**
     * loads the next snapshot back from given max revision
     * @param {Object || String} query    the query object
     * @param {Number}           revMax   revision end point (hint: -1 = to end) [optional]
     * @param {Function}         callback the function that will be called when this action has finished
     *                                    `function(err, snapshot, eventstream){}`
     */
    getFromSnapshot(query, revMax = noop) {
        return new Promise((Ok, Err) => {
            if (typeof revMax === 'function') {
                revMax = -1
            }

            if (typeof query === 'string') {
                query = { aggregateId: query }
            }

            if (!query.aggregateId) {
                var err = new Error('An aggregateId should be passed!')
                debug(err)
                return Err(err)
            }

            const getStream = (snap) =>
                new Promise((Ok, Err) => {
                    var rev = 0

                    if (snap && snap.revision !== undefined && snap.revision !== null) {
                        rev = snap.revision + 1
                    }
                    this.getEventStream(query, rev, revMax)
                        .then((stream) => {
                            if (rev > 0 && stream.lastRevision == -1) {
                                stream.lastRevision = snap.revision
                            }
                            return stream
                        })
                        .then((stream) => Ok([snap, stream]))
                        .catch((err) => Err(err))
                })

            this.store.getSnapshot(query, revMax).then(getStream).then(Ok, Err)
        })
    }

    /**
     * stores a new snapshot
     * @param {Object}   obj      the snapshot data
     * @param {Function} callback the function that will be called when this action has finished [optional]
     */
    createSnapshot(obj) {
        return new Promise((Ok, Err) => {
            if (obj.streamId && !obj.aggregateId) {
                obj.aggregateId = obj.streamId
            }

            if (!obj.aggregateId) {
                var err = new Error('An aggregateId should be passed!')
                debug(err)
                return Err(err)
            }

            obj.streamId = obj.aggregateId

            if (obj.revision) {
                if (typeof obj.revision === 'string') {
                    const castedRevision = parseFloat(obj.revision)

                    if (castedRevision && castedRevision.toString() === obj.revision) {
                        // Determines if the revision was parsed correctly, for the cases where user using custom typed revisions that's not in valid float format like: obj.revision = '1,2,3'
                        obj.revision = castedRevision
                    }
                }
            }

            const cleanup = (value) =>
                this.options.maxSnapshotsCount
                    ? this.store.cleanSnapshots(_.pick(obj, 'aggregateId', 'aggregate', 'context'))
                    : value

            this.getNewId()
                .then((id) => new Snapshot(id, obj))
                .then((snap) => snap.commitNow())
                .then((snap) => this.store.addSnapshot(snap))
                .then(cleanup)
                .then(Ok, Err)
        })
    }

    /**
     * commits all uncommittedEvents in the eventstream
     * @param eventstream the eventstream that should be saved (hint: directly use the commit function on eventstream)
     * @param {Function}  callback the function that will be called when this action has finished
     *                             `function(err, eventstream){}` (hint: eventstream.eventsToDispatch)
     */
    commit(eventstream) {
        var currentRevision = eventstream.currentRevision(),
            uncommittedEvents = [].concat(eventstream.uncommittedEvents)
        eventstream.uncommittedEvents = []

        const newId = () => this.getNewId()
        const nextPositions = () => this.store.getNextPositions(uncommittedEvents.length)

        const processPositions = (id, positions) => {
            uncommittedEvents.forEach((event, i) => {
                event.id = id + i.toString()
                event.commitId = id
                event.commitSequence = i
                event.restInCommitStream = uncommittedEvents.length - 1 - i
                event.commitStamp = new Date()
                currentRevision++
                event.streamRevision = currentRevision
                if (positions) event.position = positions[i]

                event.applyMappings()
            })
            return uncommittedEvents
            // for (var i = 0, len = uncommittedEvents.length; i < len; i++) {}
        }
        const addEvents = (uncommittedEvents) =>
            this.store
                .addEvents(uncommittedEvents)
                .catch((err) => {
                    eventstream.uncommittedEvents = uncommittedEvents.concat(
                        eventstream.uncommittedEvents
                    )
                    throw err
                })
                .then(() => uncommittedEvents)

        const publishEvents = (uncommittedEvents) => {
            if (this.publisher && this.dispatcher) {
                // push to undispatchedQueue
                this.dispatcher.addUndispatchedEvents(uncommittedEvents)
            } else {
                eventstream.eventsToDispatch = [].concat(uncommittedEvents)
            }
            return uncommittedEvents
        }
        const concatEvents = (uncommittedEvents) => {
            eventstream.events = eventstream.events.concat(uncommittedEvents)
            eventstream.currentRevision()
            return eventstream
        }

        return new Promise((Ok, Err) => {
            Promise.all([newId(), nextPositions()])
                .then(([id, positions]) => processPositions(id, positions))
                .then(addEvents)
                .then(publishEvents)
                .then(concatEvents)
                .then(Ok, Err)
        })
    }

    /**
     * loads all undispatched events
     * @param {Object || String} query    the query object [optional]
     * @param {Function}         callback the function that will be called when this action has finished
     *                                    `function(err, events){}`
     */
    getUndispatchedEvents(query = null) {
        return new Promise((Ok, Err) => {
            if (typeof query === 'string') {
                query = { aggregateId: query }
            }

            this.store.getUndispatchedEvents(query).then(Ok, Err)
        })
    }

    /**
     * loads the last event
     * @param {Object || String} query    the query object [optional]
     * @param {Function}         callback the function that will be called when this action has finished
     *                                    `function(err, event){}`
     */
    getLastEvent(query = null) {
        return new Promise((Ok, Err) => {
            if (typeof query === 'string') {
                query = { aggregateId: query }
            }

            this.store.getLastEvent(query).then(Ok, Err)
        })
    }

    /**
     * loads the last event in a stream
     * @param {Object || String} query    the query object [optional]
     * @param {Function}         callback the function that will be called when this action has finished
     *                                    `function(err, eventstream){}`
     */
    getLastEventAsStream(query = null) {
        return new Promise((Ok, Err) => {
            if (typeof query === 'string') {
                query = { aggregateId: query }
            }

            this.store
                .getLastEvent(query)
                .then((evt) => [evt].filter(Boolean))
                .then((evts) => new EventStream(this, query, evts))
                .then(Ok, Err)
        })
    }

    /**
     * Sets the given event to dispatched.
     * @param {Object || String} evtOrId  the event object or its id
     * @param {Function}         callback the function that will be called when this action has finished [optional]
     */
    setEventToDispatched(evtOrId) {
        return new Promise((Ok, Err) => {
            if (typeof evtOrId === 'object') {
                evtOrId = evtOrId.id
            }
            this.store.setEventToDispatched(evtOrId).then(Ok, Err)
        })
    }

    /**
     * loads a new id from store
     * @param {Function} callback the function that will be called when this action has finished
     */
    getNewId() {
        return this.store.getNewId()
    }
}

module.exports = Eventstore
