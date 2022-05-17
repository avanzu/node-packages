const useDuplex = require('../lib/useDuplex')
const EventEmitter = require('events')
const { creditsExhausted } = require('../lib/errors')
describe('The duplex composable', () => {
    const receiver = Object.assign(new EventEmitter(), {})
    const sender = Object.assign(new EventEmitter(), {
        sendable: jest.fn(),
        send: jest.fn(),
    })

    beforeEach(() => jest.clearAllMocks())

    it('should panic with a "credits:exhausted" error when sender has no credits left', () => {
        const { sendMessage } = useDuplex(receiver, sender)
        sender.sendable.mockReturnValue(false)

        expect(() => sendMessage({})).toThrowError(creditsExhausted('No credits available'))
    })

    it('should send the message as long as the sender is in "sendable" state', async () => {
        const { sendMessage } = useDuplex(receiver, sender)
        sender.sendable.mockReturnValue(true)

        expect(() => sendMessage({})).not.toThrow()
        expect(sender.send).toHaveBeenCalled()
    })
})
