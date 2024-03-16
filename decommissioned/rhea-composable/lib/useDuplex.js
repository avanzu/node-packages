const { ReceiverEvents } = require('rhea')
const { nanoid } = require('nanoid')
const { panic, creditsExhausted } = require('./errors')

module.exports = (receiver, sender) => {
    const replyTo = new Promise((resolve) => {
        receiver.once(ReceiverEvents.receiverOpen, () => resolve(receiver.source.address))
    })

    const messageOf = (cid, payload) =>
        replyTo.then((reply_to) => ({
            ttl: 5000,
            ...payload,
            reply_to,
            correlation_id: cid,
            message_id: nanoid(),
        }))

    const affirmSendable = () =>
        sender.sendable() || panic(creditsExhausted('No credits available'))

    const sendMessage = (message) => (affirmSendable(), { message, delivery: sender.send(message) })

    return { replyTo, messageOf, sendMessage }
}
