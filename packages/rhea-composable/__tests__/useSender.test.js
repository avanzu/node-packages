const { useSender, useConnection } = require('..')

describe('useSender', () => {
    test('sanity', () => {
        const { connectionOf } = useConnection()
        const { openSender } = useSender()
        const connection = connectionOf('foo', {
            host: process.env.__ACTIVEMQ_HOST__,
            port: process.env.__ACTIVEMQ_PORT__,
            username: 'admin',
        })
        const sender = openSender(connection, 'my-topic')
        expect(sender).toBeDefined()
    })
})
