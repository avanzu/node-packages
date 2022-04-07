const { ReceiverEvents } = require('rhea')
const { useConnection, useReceiver, useProcessor } = require('..')

describe('useProcessor', () => {
    const { connectionOf } = useConnection()
    const { openReceiver } = useReceiver()

    test('with dispatchable', async () => {
        const dummy = { send: jest.fn() }
        const delivery = { update: jest.fn() }
        const connection = connectionOf('foo', { username: 'admin' })
        const receiver = openReceiver(connection, 'some-queue')

        const { processMessages } = useProcessor(receiver)

        processMessages({ foo: () => 'bar' })

        receiver.emit(ReceiverEvents.message, {
            connection: dummy,
            message: { subject: 'foo', correlation_id: 'foo-bar' },
            delivery,
        })

        await new Promise((resolve) => process.nextTick(resolve))

        expect(dummy.send).toHaveBeenCalled()
    })

    test('without dispatchable', async () => {
        const dummy = { send: jest.fn() }
        const delivery = { update: jest.fn(), reject: jest.fn() }
        const connection = connectionOf('foo', { username: 'admin' })
        const receiver = openReceiver(connection, 'some-queue')

        const { processMessages } = useProcessor(receiver)

        processMessages({ foo: () => 'bar' })

        receiver.emit(ReceiverEvents.message, {
            connection: dummy,
            message: { subject: 'bar', correlation_id: 'foo-bar' },
            delivery,
        })

        await new Promise((resolve) => process.nextTick(resolve))

        expect(dummy.send).not.toHaveBeenCalled()
        expect(delivery.reject).toHaveBeenCalled()
    })
})
