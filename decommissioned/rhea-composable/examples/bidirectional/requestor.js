const { useDialog, useConnection } = require('../..')
const debug = require('debug')('example/bidirectinal/requestor')

module.exports = () => {
    const connection = useConnection().connectionOf('my-connection-id', {
        host: process.env.__ACTIVEMQ_HOST__,
        port: process.env.__ACTIVEMQ_PORT__,
        username: 'admin',
    })

    const sender = useDialog(connection).openDialog(process.env.DIALOG_QUEUE_NAME)

    // triggering the subject based handler
    Promise.resolve({ subject: 'mySubject', body: { foo: 'bar' } })
        .then((message) => (debug('sending request', message), message))
        .then((message) => sender.send(message))
        .then(
            (reply) => {
                debug('Received reply %o', reply)
            },
            (error) => {
                debug('Received error %o', error)
            }
        )

    Promise.resolve({ ttl: 10000, body: { bar: 'baz' } })
        .then((message) => (debug('sending request', message), message))
        .then((message) => sender.send(message))
        .then(
            (reply) => {
                debug('Received reply %o', reply)
            },
            (error) => {
                debug('Received error %o', error)
            }
        )
}
