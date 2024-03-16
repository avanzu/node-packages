jest.mock('rhea')
const Emitter = require('events')
const { create_connection, ConnectionEvents } = require('rhea')
const useConnection = require('../lib/useConnection')
const context = require('./context')()
const { connectionOf, closeConnection, connectionExists } = useConnection()

describe('useConnection', () => {
    const dummy = Object.assign(new Emitter(), {
        connect: jest.fn(() => dummy.emit(ConnectionEvents.connectionOpen)),
        close: jest.fn(() => dummy.emit(ConnectionEvents.connectionClose)),
    })

    create_connection.mockReturnValue(dummy)

    beforeEach(() => jest.clearAllMocks())
    afterAll(() => context.tearDown())

    it('should open a new connection with a given id', () => {
        const connection = connectionOf('foo', { host: 'localhost', username: 'admin' })
        expect(connection).toBe(dummy)
        expect(connection.listenerCount(ConnectionEvents.connectionClose)).toBe(1)
        expect(create_connection).toHaveBeenCalled()
    })

    it('Should reuses existing connections', () => {
        const connection = connectionOf('foo', { host: 'localhost', username: 'admin' })
        expect(connection).toBe(dummy)
        expect(create_connection).not.toHaveBeenCalled()
    })

    it('should close existing connections', async () => {
        const connection = connectionOf('foo', { host: 'localhost', username: 'admin' })
        await expect(closeConnection(connection)).resolves.toBeUndefined()
        expect(connectionExists('foo')).toBe(false)
    })
})
