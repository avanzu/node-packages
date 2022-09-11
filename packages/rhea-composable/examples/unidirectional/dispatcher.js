const { useSender, useConnection } = require('../..')
const debug = require('debug')('example/unidirectinal/dispatcher')
module.exports = () => {
    const connection = useConnection().connectionOf('my-connection-id', {
        host: process.env.__ACTIVEMQ_HOST__,
        port: process.env.__ACTIVEMQ_PORT__,
        username: 'admin',
    })

    const sender = useSender().openSender(connection, process.env.WORKER_QUEUE_NAME)

    debug('dispatching subject based message')
    sender.send({ subject: 'mySubject', body: { foo: 'bar' } })

    debug('dispatching message without subject')
    sender.send({ subject: '', body: { bar: 'baz' } })
}
