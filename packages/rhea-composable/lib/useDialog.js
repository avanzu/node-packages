const { debug, inspect } = require('./inspect')('useDialog')
const { nanoid } = require('nanoid')
const useRequests = require('./useRequests')
const useSender = require('./useSender')
const useReceiver = require('./useReceiver')
const { ReceiverEvents } = require('rhea')

module.exports = (connection) => {
    const { storeRequest, dropRequest, lookupRequest } = useRequests()
    const { openReceiver, oneUp, allDone, noLuck } = useReceiver(connection)
    const { openSender } = useSender(connection)

    const openDialog = (topic) => {
        const sender = openSender(connection, {
            target: { address: topic },
            autoaccept: false,
            autosettle: false,
        })

        const receiver = openReceiver(connection, {
            source: { dynamic: true },
            autoaccept: false,
            autosettle: false,
        })

        const onMesssage = (context) => {
            const { message, delivery } = context
            const { correlation_id } = message

            lookupRequest(correlation_id)
                .then(({ onSuccess }) => onSuccess(message))
                .then(() => dropRequest(correlation_id))
                .then(() => receiver.add_credit(1))
                .then(allDone(delivery), noLuck(delivery))
                .then(oneUp(receiver))
        }

        const replyTo = () => receiver.source.address

        receiver.on(ReceiverEvents.message, onMesssage)

        const messageOf = (cid, payload) => ({
            ...payload,
            reply_to: replyTo(),
            correlation_id: cid,
            message_id: nanoid(),
        })

        const send = (payload) =>
            new Promise((resolve, reject) => {
                const cid = nanoid()
                const message = messageOf(cid, payload)

                storeRequest(cid, resolve, reject, message).then((message) => sender.send(message))
            })

        return { send }
    }

    return { openDialog }
}
