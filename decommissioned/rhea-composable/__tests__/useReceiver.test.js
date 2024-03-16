const { useReceiver, useConnection } = require('..')
describe('useReceiver', () => {
    test('sanity', () => {
        const { connectionOf } = useConnection()
        const { openReceiver } = useReceiver()
        const connection = connectionOf('foo', {
            host: process.env.__ACTIVEMQ_HOST__,
            port: process.env.__ACTIVEMQ_PORT__,
            username: 'admin',
        })
        const receiver = openReceiver(connection, 'my-topic')
        expect(receiver).toBeDefined()
    })
})
