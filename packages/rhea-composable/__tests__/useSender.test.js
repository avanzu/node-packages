const { useSender, useConnection } = require('..')

describe('useSender', () => {
    test('sanity', () => {
        const { connectionOf } = useConnection()
        const { openSender } = useSender()
        const connection = connectionOf('foo', { username: 'admin' })
        const sender = openSender(connection, 'my-topic')
        expect(sender).toBeDefined()
    })
})
