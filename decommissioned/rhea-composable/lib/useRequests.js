const { debug, inspect, notice } = require('./inspect')('useRequests')
const { noSuchRequest, requestTimedOut } = require('./errors')
const { pipe } = require('ramda')
const useDelivery = require('./useDelivery')
const useMessage = require('./useMessage')

module.exports = () => {
    const store = new Map()

    const get = (key) => store.get(key)
    const has = (key) => store.has(key)
    const put = (key, value) => store.set(key, value)
    const del = (key) => store.delete(key)

    const storeRequest = ({ key, onSuccess, onError, delivery, message }) =>
        new Promise((resolve) => {
            debug(`Storing request [${key}]`)
            put(key, { onSuccess, onError, delivery, message })
            resolve({ key, message, delivery })
        })

    const lookupRequest = (key) =>
        new Promise((resolve, reject) => {
            debug(`Looking up request [${key}]`)
            const storeHit = pipe(notice(`Request [${key}] found`), get, resolve)
            const storeMiss = pipe(noSuchRequest, inspect(`Request [${key}] not found. %o`), reject)

            has(key) ? storeHit(key) : storeMiss(key)
        })

    const cleanup = (key) => {
        const { timeout } = get(key)
        debug('Clearing Timeout of request [%s] %o', key, timeout)
        timeout && clearTimeout(timeout)
        del(key)
    }

    const dropRequest = (key) => {
        debug(`Dropping request [${key}]`)
        has(key) && cleanup(key)
    }

    const storeTimeout = (key, timeout) => {
        has(key) && put(key, { ...get(key), timeout })
    }

    const autoExpire = ({ key, message, delivery }) => {
        const { lifetime } = useMessage(message)
        const { settle } = useDelivery(delivery)
        const { drop } = useLookup(key)
        const conclude = ({ onError }) => onError(requestTimedOut(key, lifetime()))
        const expire = () =>
            Promise.resolve(key)
                .then(inspect('Expiring request [%s]'))
                .then(lookupRequest)
                .then(conclude, settle)
                .then(drop)

        storeTimeout(key, setTimeout(expire, lifetime()))
    }

    const storeReceipt = (key, onSuccess, onError) => (receipt) =>
        storeRequest({ key, onSuccess, onError, ...receipt })

    const useLookup = (id) => ({
        retrieve: () => lookupRequest(id),
        drop: () => dropRequest(id),
    })

    return {
        storeRequest,
        lookupRequest,
        dropRequest,
        storeTimeout,
        autoExpire,
        storeReceipt,
        useLookup,
    }
}
