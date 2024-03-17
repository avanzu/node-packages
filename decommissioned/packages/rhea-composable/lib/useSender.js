const { SenderEvents } = require('rhea')
const { inspect, debug, notice } = require('./inspect')('useSender')

module.exports = () => {
    const openSender = (connection, options) => {
        debug('Opening sender with %o', options)
        const sender = connection.open_sender(options)

        sender.on(SenderEvents.senderError, console.error)

        sender.on(SenderEvents.accepted, notice('Sender Accepted'))
        sender.on(SenderEvents.rejected, inspect('Sender Rejected: %s'))
        sender.on(SenderEvents.released, inspect('Sender Released: %s'))

        return sender
    }

    return { openSender }
}
