const redis = require('redis')
const { ClientEvents } = require('./events')
const { debug } = require('./inspect')('useConnection')
module.exports = () => {
    const connections = new Map()

    const makeConnection = (id, options) => {
        debug('Creating new connection [%s] with options %o', id, options)
        const connection = redis.createClient(options)
        connections.set(id, connection)

        Object.entries(ClientEvents).forEach(([name, event]) => {
            connection.on(event, () => debug('[%s] occured on connection [%s]', name, id))
        })

        connection.on(ClientEvents.clientDisconnected, () => {
            debug('Connection [%s] closed. Removing from pool.', id)
            connection.removeAllListeners()
            connections.delete(id)
        })

        connection.connect()
    }

    const connectionOf = (id, options) => {
        connections.has(id) || makeConnection(id, options)
        return connections.get(id)
    }

    const closeConnection = (connection) =>
        new Promise((resolve) => {
            connection.once(ClientEvents.clientDisconnected, () => {
                debug('close connection can now resolve')
                resolve()
            })

            connection.quit()
        })

    const connectionExists = (key) => connections.has(key)

    return { connectionOf, closeConnection, connectionExists }
}
