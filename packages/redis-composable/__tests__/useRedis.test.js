const { useRedis } = require('..')

describe('useRedis', () => {
    const { connectionOf, closeConnection, connectionExists } = useRedis()

    const connection = connectionOf('testing', { url: 'redis://localhost:6379' })

    test('presence', () => {
        expect(connection).toBeDefined()
        expect(connectionExists('testing')).toBe(true)
    })

    test('reuse', () => {
        const instance = connectionOf('testing', { url: 'redis://localhost:6379' })
        expect(instance).toBe(connection)
    })

    test('closing', async () => {
        await closeConnection(connection)
        expect(connectionExists('testing')).toBe(false)
    })
})
