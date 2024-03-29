const { ReceiverEvents } = require('rhea')
const { useConnection, useProcessor } = require('..')
const { panic } = require('../lib/errors')

describe('useProcessor', () => {
    const { connectionOf } = useConnection()

    test('with dispatchable', async () => {
        const dummy = { send: jest.fn() }
        const delivery = { update: jest.fn() }
        const connection = connectionOf('foo', {
            host: process.env.__ACTIVEMQ_HOST__,
            port: process.env.__ACTIVEMQ_PORT__,
            username: 'admin',
        })

        const { processMessages } = useProcessor(connection)

        const receiver = processMessages('my-channel', { foo: () => 'bar' })

        receiver.emit(ReceiverEvents.message, {
            connection: dummy,
            message: { subject: 'foo', correlation_id: 'foo-bar', reply_to: 'someone' },
            delivery,
        })

        await new Promise((resolve) => process.nextTick(resolve))

        expect(dummy.send).toHaveBeenCalled()
    })

    test('with default dispatchable', async () => {
        const dummy = { send: jest.fn() }
        const delivery = { update: jest.fn() }
        const connection = connectionOf('foo', { username: 'admin' })

        const { processMessages } = useProcessor(connection)

        const receiver = processMessages('my-channel', { default: () => 'bar' })

        receiver.emit(ReceiverEvents.message, {
            connection: dummy,
            message: { subject: 'foo', correlation_id: 'foo-bar', reply_to: 'someone' },
            delivery,
        })

        await new Promise((resolve) => process.nextTick(resolve))

        expect(dummy.send).toHaveBeenCalled()
    })

    test('without dispatchable', async () => {
        const dummy = { send: jest.fn() }
        const delivery = { update: jest.fn(), reject: jest.fn(), release: jest.fn() }
        const connection = connectionOf('foo', { username: 'admin' })
        // const receiver = openReceiver(connection, 'some-queue')

        const { processMessages } = useProcessor(connection)

        const receiver = processMessages('some-queue', { foo: () => 'bar' })

        receiver.emit(ReceiverEvents.message, {
            connection: dummy,
            message: { subject: 'bar', correlation_id: 'foo-bar', reply_to: 'someone' },
            delivery,
        })

        await new Promise((resolve) => process.nextTick(resolve))

        expect(dummy.send).not.toHaveBeenCalled()
        expect(delivery.release).toHaveBeenCalled()
    })

    test('processing error', async () => {
        const dummy = { send: jest.fn() }
        const delivery = { update: jest.fn(), reject: jest.fn(), release: jest.fn() }
        const connection = connectionOf('foo', { username: 'admin' })
        // const receiver = openReceiver(connection, 'some-queue')

        const { processMessages } = useProcessor(connection)

        const receiver = processMessages('some-queue', {
            badness: () => panic(new Error('Will never work')),
        })

        receiver.emit(ReceiverEvents.message, {
            connection: dummy,
            message: { subject: 'badness', correlation_id: 'foo-bar', reply_to: 'someone' },
            delivery,
        })

        await new Promise((resolve) => process.nextTick(resolve))

        expect(dummy.send).toHaveBeenCalledWith(
            expect.objectContaining({
                subject: 'processing:failed',
                application_properties: expect.objectContaining({
                    success: false,
                    statusCode: 500,
                }),
            })
        )
        expect(delivery.reject).toHaveBeenCalled()
    })
})
