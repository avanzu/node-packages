const { debug, inspect, notice } = require('./inspect')('useRequests')
const { noSuchRequest } = require('./errors')
const { pipe } = require('ramda')
module.exports = () => {
    const store = new Map()

    const storeRequest = (key, onSuccess, onError, payload) =>
        new Promise((resolve) => {
            debug('Storing request [%s]', key)
            store.set(key, { onSuccess, onError, payload })
            resolve(payload)
        })

    const lookupRequest = (key) =>
        new Promise((resolve, reject) => {
            debug('Looking up request [%s]', key)
            store.has(key)
                ? pipe(notice('Requst [%s] found'), resolve)(store.get(key))
                : pipe(noSuchRequest, inspect('Request [%s] not found'), reject)(key)
        })

    const dropRequest = (key) => {
        debug('Dropping request [%s]', key)
        store.has(key) && store.delete(key)
    }

    return { storeRequest, lookupRequest, dropRequest }
}
