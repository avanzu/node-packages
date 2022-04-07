const rhea = require('rhea')
const { ConnectionEvents } = rhea
const { debug } = require('./inspect')('useConnection')
module.exports = () => {
    const connections = new Map()

    const makeConnection = (id, options) => {
        debug('Creating new connection [%s] with options %o', id, options)
        const connection = rhea.create_connection(options)
        connections.set(id, connection)
        connection.on(ConnectionEvents.connectionClose, () => {
            debug('Connection [%s] closed. Removing from pool.', id)
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
            connection.on(ConnectionEvents.connectionClose, () => {
                debug('close connection can now resolve')
                resolve()
            })

            connection.close()
        })

    const connectionExists = (key) => connections.has(key)

    return { connectionOf, closeConnection, connectionExists }
}
