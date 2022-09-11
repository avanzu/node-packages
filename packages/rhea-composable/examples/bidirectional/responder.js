const { useConnection, useProcessor } = require('../..')
const debug = require('debug')('example/bidirectinal/responder')

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
            debug('Received request for "mySubject" %o', message)
            return {
                subject: 'mySubjectReply',
                body: { received: message },
            }
        },
        default: ({ message }) =>
            new Promise((Ok) => {
                debug('Received request on default handler %o', message)
                //const { subject, body } = message
                Ok({ body: { received: message } })
            }),
    }

    // attach handlers to the queue
    useProcessor(connection).processMessages(process.env.DIALOG_QUEUE_NAME, handlers)
}
