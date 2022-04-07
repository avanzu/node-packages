const { useReceiver, useConnection } = require('..')

describe('useReceiver', () => {
    test('sanity', () => {
        const { connectionOf } = useConnection()
        const { openReceiver } = useReceiver()
        const connection = connectionOf('foo', { username: 'admin' })
        const receiver = openReceiver(connection, 'my-topic')
        expect(receiver).toBeDefined()
    })
})
