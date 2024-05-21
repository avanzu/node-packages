const { useRedis } = require('..')

describe('useRedis', () => {
    const { connectionOf, closeConnection, connectionExists } = useRedis()

    const connection = connectionOf('testing', { url: process.env.REDIS_URL })

    test('presence', () => {
        expect(connection).toBeDefined()
        expect(connectionExists('testing')).toBe(true)
    })

    test('reuse', () => {
        const instance = connectionOf('testing', { url: process.env.REDIS_URL })
        expect(instance).toBe(connection)
    })

    test('closing', async () => {
        await closeConnection(connection)
        expect(connectionExists('testing')).toBe(false)
    })
})
