var debug = require('debug')('@avanzu/eventstore/eventstore'),
    EventEmitter = require('events').EventEmitter,
    { Option, Result } = require('@avanzu/std'),
    { noop, normalizeQuery, requireId, isString } = require('./util'),
    { defaultTo, propOr, is, pick, add, inc, subtract } = require('ramda'),
    EventDispatcher = require('./eventDispatcher'),
    EventStream = require('./eventStream'),
    Snapshot = require('./snapshot')

class Eventstore extends EventEmitter {
    constructor(options, store) {
        super(options)
        this.options = options || {}
        this.store = store
        this.eventMappings = {}
        this.publisher = Option.None()
        this.dispatcher = Option.None()
    }
    /**
     * Inject function for event publishing.
     * @param {Function} fn the function to be injected
     * @returns {Eventstore}  to be able to chain...
     */
    useEventPublisher(fn) {
        this.publisher = Option.Some(fn)

        return this
    }

    get dbType() {
        return Option.fromNullable(this.options.type).unwrapOr('inmemory')
    }

    get streamableStore() {
        return Result.fromPredicate((store) => store.streamable, this.store)
            .mapErr(() => new Error(`Streaming API is not suppoted by ${this.dbType}.`))
            .unwrap()
    }

    get deletableStore() {
        return Result.fromPredicate((store) => store.deleteStream, this.store)
            .mapErr(() => new Error(`Deletion API is not suppoted by ${this.dbType}.`))
            .unwrap()
    }

    get maxSnapshots() {
        return Result.fromPredicate(Boolean, this.options.maxSnapshotsCount)
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
        this.eventMappings = Result.fromPredicate(is(Object), mappings)
            .mapErr(() => new Error('Please pass a valid mapping values!'))
            .unwrap()

        return this
    }

    initDispatcher() {
        this.publisher
            .map((publisher) => new EventDispatcher(publisher, this))
            .tap((dispatcher) => (this.dispatcher = Option.Some(dispatcher)))
            .tap((dispatcher) => dispatcher.start())
            .bimap(
                () => debug('no publisher defined'),
                () => debug('init event dispatcher')
            )
            .unwrapAlways(this)
    }

    /**
     * Call this function to initialize the eventstore.
     * If an event publisher function was injected it will additionally initialize an event dispatcher.
     * @param {Function} callback the function that will be called when this action has finished [optional]
     */
    init() {
        return new Promise((Ok, Err) => {
            this.store
                .on('connect', () => this.emit('connect'))
                .on('disconnect', () => this.emit('disconnect'))
                .connect()
                .then(() => this.initDispatcher())
                .then(Ok, Err)
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
        if (typeof query === 'number') {
            limit = skip
            skip = query
            query = {}
        }

        const q = normalizeQuery(query).unwrap()
        return this.streamableStore.streamEvents(q, skip, limit)
    }

    /**
     * streams all the events since passed commitStamp
     * @param {Date}     commitStamp the date object
     * @param {Number}   skip        how many events should be skipped? [optional]
     * @param {Number}   limit       how many events do you want in the result? [optional]
     * @returns {Stream} a stream with the events
     */
    streamEventsSince(commitStamp, skip, limit) {
        const stamp = Result.fromNullable(commitStamp, 'Please pass in a date object!')
            .map((stamp) => new Date(stamp))
            .unwrap()

        return this.streamableStore.streamEventsSince(stamp, skip, limit)
    }

    /**
     * stream events by revision
     * @param {Object || String} query    the query object
     * @param {Number}           revMin   revision start point [optional]
     * @param {Number}           revMax   revision end point (hint: -1 = to end) [optional]
     * @returns {Stream} a stream with the events
     */
    streamEventsByRevision(query, revMin, revMax) {
        return normalizeQuery(query)
            .unwrapWith(requireId)
            .map((query) => this.store.streamEventsByRevision(query, revMin, revMax))
            .unwrap()
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

            const next = () => this.getEvents(query, skip + limit, limit)

            return this.store
                .getEvents(query, skip, limit)
                .then(defaultTo({}))
                .then((res) => Object.assign(res, { next }))
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
    getEventsSince(commitStamp, skip = 0, limit = -1) {
        return new Promise((Ok, Err) => {
            const [stamp, $skip] = Result.fromNullable(commitStamp, 'Please pass in a date object!')
                .map((stamp) => new Date(stamp))
                .map((stamp) => [stamp, skip + limit])
                .unwrap()

            const next = () => this.getEventsSince(stamp, $skip, limit)

            return this.store
                .getEventsSince(stamp, skip, limit)
                .then(defaultTo({}))
                .then((res) => Object.assign(res, { next }))
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
    getEventsByRevision(query, revMin = 0, revMax = -1) {
        return new Promise((Ok, Err) => {
            normalizeQuery(query)
                .unwrapWith(requireId)
                .promise()
                .then((query) => this.store.getEventsByRevision(query, revMin, revMax))
                .then(Ok, Err)
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
    getEventStream(query, revMin = 0, revMax = -1) {
        return new Promise((Ok, Err) => {
            const q = normalizeQuery(query).unwrapWith(requireId).unwrap()
            this.store
                .getEventsByRevision(q, revMin, revMax)
                .then((evts) => new EventStream(this, q, evts))
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
    getFromSnapshot(query, revMax = -1) {
        return new Promise((Ok, Err) => {
            const q = normalizeQuery(query).unwrapWith(requireId).unwrap()

            const getStream = (snap) =>
                new Promise((Ok, Err) => {
                    var rev = 0

                    if (snap && snap.revision !== undefined && snap.revision !== null) {
                        rev = snap.revision + 1
                    }
                    this.getEventStream(q, rev, revMax)
                        .then((stream) => {
                            if (rev > 0 && stream.lastRevision == -1) {
                                stream.lastRevision = snap.revision
                            }
                            return stream
                        })
                        .then((stream) => Ok([snap, stream]))
                        .catch((err) => Err(err))
                })

            this.store.getSnapshot(q, revMax).then(getStream).then(Ok, Err)
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

            requireId(obj).unwrapWith(() => (obj.streamId = obj.aggregateId))

            Result.fromNullable(obj.revision)
                .chain((rev) => Result.fromPredicate(isString, rev))
                .map(parseFloat)
                .chain((rev) => Result.fromPredicate((r) => r.toString() === obj.revision, rev))
                .tap((rev) => (obj.revision = rev))
                .unwrapOr(null)

            const cleanup = (value) =>
                this.maxSnapshots
                    .map(() => pick(['aggregateId', 'aggregate', 'context'], obj))
                    .map((query) => this.store.cleanSnapshots(query))
                    .unwrapOr(value)

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
        const currentRevision = eventstream.currentRevision()
        const uncommittedEvents = [].concat(eventstream.uncommittedEvents)
        eventstream.uncommittedEvents = []

        const newId = () => this.getNewId()
        const nextPositions = () => this.store.getNextPositions(uncommittedEvents.length)

        const processPositions = (id, positions) => {
            uncommittedEvents.forEach((event, i) => {
                event.id = id + i.toString()
                event.commitId = id
                event.commitSequence = i
                event.restInCommitStream = subtract(uncommittedEvents.length, inc(i))
                event.commitStamp = new Date()
                event.streamRevision = add(currentRevision, inc(i))
                if (positions) event.position = positions[i]

                event.applyMappings()
            })
            return uncommittedEvents
        }
        const addEvents = (newEvents) =>
            this.store
                .addEvents(newEvents)
                .then(() => newEvents)
                .catch((err) => {
                    eventstream.uncommittedEvents = newEvents.concat(eventstream.uncommittedEvents)
                    throw err
                })

        const publishEvents = (uncommittedEvents) =>
            this.dispatcher
                .bimap(
                    () => (eventstream.eventsToDispatch = [].concat(uncommittedEvents)),
                    (dispatcher) => dispatcher.addUndispatchedEvents(uncommittedEvents)
                )
                .unwrapAlways(uncommittedEvents)

        const concatEvents = (newEvents) =>
            Option.Some(eventstream)
                .tap((es) => (es.events = es.events.concat(newEvents)))
                .tap((es) => es.currentRevision())
                .unwrap()

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
            normalizeQuery(query)
                .promise()
                .then((query) => this.store.getUndispatchedEvents(query))
                .then(Ok, Err)
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
            normalizeQuery(query)
                .promise()
                .then((query) => this.store.getLastEvent(query))
                .then(Ok, Err)
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
            normalizeQuery(query)
                .promise()
                .then((query) => this.store.getLastEvent(query))
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
            const id = propOr(evtOrId, 'id', evtOrId)
            this.store.setEventToDispatched(id).then(Ok, Err)
        })
    }

    /**
     * loads a new id from store
     * @param {Function} callback the function that will be called when this action has finished
     */
    getNewId() {
        return this.store.getNewId()
    }

    deleteStream(aggregateId) {
        return new Promise((Ok, Err) => {
            // if (!this.store.deleteStream) throw new Error('Store does not support deletion')

            this.deletableStore
                .deleteStream(aggregateId)
                .then((events) => new EventStream(this, { aggregateId }, events))
                .then((stream) => stream.addTombstoneEvent())
                .then(Ok, Err)
        })
    }
}

module.exports = Eventstore
