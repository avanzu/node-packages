const { useConnection, useProcessor } = require('../..')
const debug = require('debug')('example/unidirectinal/worker')
module.exports = () => {
    const connection = useConnection().connectionOf('my-connection-id', {
        host: process.env.__ACTIVEMQ_HOST__,
        port: process.env.__ACTIVEMQ_PORT__,
        username: 'admin',
    })

    // declare a map of message handlers
    const handlers = {
        // subject based message handling
        mySubject: ({ message }) => {
            debug('"mySubject" handler received message %o', message)
        },
        default: ({ message }) => {
            debug('default handler received message %o', message)
        },
    }

    // attach handlers to the queue
    useProcessor(connection).processMessages(process.env.WORKER_QUEUE_NAME, handlers)
}
