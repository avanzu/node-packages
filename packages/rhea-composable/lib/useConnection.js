const rhea = require('rhea')
const { ConnectionEvents } = rhea
const { debug } = require('./inspect')('useConnection')
const useConnectionString = require('./useConnectionString')

module.exports = () => {
    const connections = new Map()
    const { parse } = useConnectionString()

    const makeConnection = (id, options) => {
        const opts = parse(options)
        debug('Creating new connection [%s] with options %o', id, opts)
        const connection = rhea.create_connection(opts)
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
