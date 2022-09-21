/* eslint-disable no-unused-vars */
var EventEmitter = require('events').EventEmitter,
    prequire = require('parent-require'),
    uuid = require('uuid').v4

/**
 * Store constructor
 * @param {Object} options The options can have information like host, port, etc. [optional]
 */

const implementError = () => {
    var err = new Error('Please implement this function!')
    return Promise.reject(err)
}

const silentWarning = () => {
    console.warn('Snapshot cleaning is not implemented for this kind of store')
    return Promise.resolve()
}

class Store extends EventEmitter {
    constructor() {
        super()
    }
    /**
     * Initiate communication with the queue.
     * @return {Promise<Store>}
     */
    connect() {
        return implementError()
    }

    /**
     * Terminate communication with the queue.
     * @return {Promise<Store>}
     */
    disconnect() {
        return implementError()
    }

    /**
     * Use this function to obtain a new id.
     * @return {Promise<string>}
     */
    getNewId() {
        return Promise.resolve(uuid().toString())
    }

    /**
     * Use this function to an array containing the next position numbers
     * @param  {number} positins Number of positions to provide.
     * @return {Promise<number[]>}
     */
    getNextPositions(positions) {
        return Promise.resolve(null)
    }

    /**
     * loads the events
     * @param {Object}   query    the query object
     * @param {Number}   skip     how many events should be skipped?
     * @param {Number}   limit    how many events do you want in the result?
     * @return {Promise<events[]>}
     */
    getEvents(query, skip, limit) {
        return implementError()
    }

    /**
     * loads all the events since passed commitStamp
     * @param {Date}     commitStamp the date object
     * @param {Number}   skip        how many events should be skipped? [optional]
     * @param {Number}   limit       how many events do you want in the result? [optional]
     * @return {Promise<events[]>}
     */
    getEventsSince(commitStamp, skip, limit) {
        return implementError()
    }

    /**
     * loads the events
     * @param {Object}   query    the query object
     * @param {Number}   revMin   revision start point
     * @param {Number}   revMax   revision end point (hint: -1 = to end)
     * @return {Promise<events[]>}
     */
    getEventsByRevision(query, revMin, revMax) {
        return implementError()
    }

    /**
     * loads the next snapshot back from given max revision
     * @param {Object}   query    the query object
     * @param {Number}   revMax   revision end point (hint: -1 = to end)
     * @return {Promise<Snapshot>}
     */
    getSnapshot(query, revMax) {
        return implementError()
    }

    /**
     * stores a new snapshot
     * @param {Object}   snap     the snapshot data
     * @return {Promise}
     */
    addSnapshot(snap) {
        return implementError()
    }

    /**
     * stores a new snapshot
     * @param {Object}   query    the query object
     * @return {Promise}
     */
    cleanSnapshots(query) {
        return silentWarning()
    }

    /**
     * stores the passed events
     * @param {Array}    evts     the events
     * @return {Promise}
     * @param {Function} callback the function that will be called when this action has finished [optional]
     */
    addEvents(evts) {
        return implementError()
    }

    /**
     * loads the last event
     * @param {Object}   query    the query object [optional]
     * @return {Promise<event>}
     */
    getLastEvent(query) {
        return implementError()
    }

    /**
     * loads all undispatched events
     * @param {Object}   query    the query object [optional]
     * @return {Promise<events[]>}
     */
    getUndispatchedEvents(query) {
        return implementError()
    }

    /**
     * Sets the given event to dispatched.
     * @param {String}   id       the event id
     * @return {Promise}
     */
    setEventToDispatched(id) {
        return implementError()
    }

    /**
     * NEVER USE THIS FUNCTION!!! ONLY FOR TESTS!
     * clears the complete store...
     * @return {Promise}
     * @param {Function} callback the function that will be called when this action has finished [optional]
     */
    clear() {
        return implementError()
    }

    static use(toRequire) {
        return require(toRequire)
    }
}

module.exports = Store
