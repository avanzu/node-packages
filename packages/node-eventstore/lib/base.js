var EventEmitter = require('events').EventEmitter,
    prequire = require('parent-require'),
    uuid = require('uuid').v4

/**
 * Store constructor
 * @param {Object} options The options can have information like host, port, etc. [optional]
 */

function implementError(callback) {
    var err = new Error('Please implement this function!')
    if (callback) callback(err)
    throw err
}

function silentWarning(callback) {
    console.warn('Snapshot cleaning is not implemented for this kind of store')
    callback()
}

class Store extends EventEmitter {
    constructor() {
        super()
    }
    /**
     * Initiate communication with the queue.
     * @param  {Function} callback The function, that will be called when the this action is completed. [optional]
     *                             `function(err, queue){}`
     */
    connect(callback) {
        implementError(callback)
    }

    /**
     * Terminate communication with the queue.
     * @param  {Function} callback The function, that will be called when the this action is completed. [optional]
     *                             `function(err){}`
     */
    disconnect(callback) {
        implementError(callback)
    }

    /**
     * Use this function to obtain a new id.
     * @param  {Function} callback The function, that will be called when the this action is completed.
     *                             `function(err, id){}` id is of type String.
     */
    getNewId(callback) {
        var id = uuid().toString()
        if (callback) callback(null, id)
    }

    /**
     * Use this function to an array containing the next position numbers
     * @param  {number} positins Number of positions to provide.
     * @param  {Function} callback The function, that will be called when the this action is completed.
     *                             `function(err, positions){}` positions is either undefined if option is not enabled/supported or array with positions
     */
    getNextPositions(positions, callback) {
        callback(null)
    }

    /**
     * loads the events
     * @param {Object}   query    the query object
     * @param {Number}   skip     how many events should be skipped?
     * @param {Number}   limit    how many events do you want in the result?
     * @param {Function} callback the function that will be called when this action has finished
     *                            `function(err, events){}`
     */
    getEvents(query, skip, limit, callback) {
        implementError(callback)
    }

    /**
     * loads all the events since passed commitStamp
     * @param {Date}     commitStamp the date object
     * @param {Number}   skip        how many events should be skipped? [optional]
     * @param {Number}   limit       how many events do you want in the result? [optional]
     * @param {Function} callback    the function that will be called when this action has finished
     *                               `function(err, events){}`
     */
    getEventsSince(commitStamp, skip, limit, callback) {
        implementError(callback)
    }

    /**
     * loads the events
     * @param {Object}   query    the query object
     * @param {Number}   revMin   revision start point
     * @param {Number}   revMax   revision end point (hint: -1 = to end)
     * @param {Function} callback the function that will be called when this action has finished
     *                            `function(err, events){}`
     */
    getEventsByRevision(query, revMin, revMax, callback) {
        implementError(callback)
    }

    /**
     * loads the next snapshot back from given max revision
     * @param {Object}   query    the query object
     * @param {Number}   revMax   revision end point (hint: -1 = to end)
     * @param {Function} callback the function that will be called when this action has finished
     *                            `function(err, snapshot){}`
     */
    getSnapshot(query, revMax, callback) {
        implementError(callback)
    }

    /**
     * stores a new snapshot
     * @param {Object}   snap     the snapshot data
     * @param {Function} callback the function that will be called when this action has finished [optional]
     */
    addSnapshot(snap, callback) {
        implementError(callback)
    }

    /**
     * stores a new snapshot
     * @param {Object}   query    the query object
     * @param {Function} callback the function that will be called when this action has finished [optional]
     */
    cleanSnapshots(query, callback) {
        silentWarning(callback)
    }

    /**
     * stores the passed events
     * @param {Array}    evts     the events
     * @param {Function} callback the function that will be called when this action has finished [optional]
     */
    addEvents(evts, callback) {
        implementError(callback)
    }

    /**
     * loads the last event
     * @param {Object}   query    the query object [optional]
     * @param {Function} callback the function that will be called when this action has finished
     *                            `function(err, event){}`
     */
    getLastEvent(query, callback) {
        implementError(callback)
    }

    /**
     * loads all undispatched events
     * @param {Object}   query    the query object [optional]
     * @param {Function} callback the function that will be called when this action has finished
     *                            `function(err, events){}`
     */
    getUndispatchedEvents(query, callback) {
        implementError(callback)
    }

    /**
     * Sets the given event to dispatched.
     * @param {String}   id       the event id
     * @param {Function} callback the function that will be called when this action has finished [optional]
     */
    setEventToDispatched(id, callback) {
        implementError(callback)
    }

    /**
     * NEVER USE THIS FUNCTION!!! ONLY FOR TESTS!
     * clears the complete store...
     * @param {Function} callback the function that will be called when this action has finished [optional]
     */
    clear(callback) {
        implementError(callback)
    }

    static use(toRequire) {
        var required
        try {
            required = require(toRequire)
        } catch (e) {
            // workaround when `npm link`'ed for development
            required = prequire(toRequire)
        }
        return required
    }
}

module.exports = Store
