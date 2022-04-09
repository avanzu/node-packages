const { ReceiverEvents } = require('rhea')
const { debug } = require('./inspect')('useReceiver')

module.exports = () => {
    const openReceiver = (connection, options) => {
        debug('Opening receiver with %o', options)
        const receiver = connection.open_receiver(options)
        receiver.on(ReceiverEvents.receiverError, console.error)
        return receiver
    }

    const oneUp = (receiver) => receiver.add_credit(1)

    return { openReceiver, oneUp }
}
