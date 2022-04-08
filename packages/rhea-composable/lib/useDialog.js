const { debug, inspect, notice } = require('./inspect')('useDialog')
const { nanoid } = require('nanoid')
const useRequests = require('./useRequests')
const useSender = require('./useSender')
const useReceiver = require('./useReceiver')
const { ReceiverEvents } = require('rhea')
const { requestTimedOut } = require('./errors')

module.exports = (connection) => {
    const { storeRequest, dropRequest, lookupRequest, storeTimeout } = useRequests()
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
            const { correlation_id, ttl } = message

            debug('Message [%s] with TTL of %sms received', correlation_id, ttl)

            lookupRequest(correlation_id)
                .then(notice(`Resolving request [${correlation_id}]`))
                .then(({ onSuccess }) => onSuccess(message))
                .then(() => dropRequest(correlation_id))
                .then(allDone(delivery), noLuck(delivery))
                .then(oneUp(receiver))
        }

        const replyTo = new Promise((resolve) => {
            receiver.once(ReceiverEvents.receiverOpen, () => resolve(receiver.source.address))
        })

        receiver.on(ReceiverEvents.message, onMesssage)

        const messageOf = (cid, payload) =>
            replyTo.then((reply_to) => ({
                ttl: 5000,
                ...payload,
                reply_to,
                correlation_id: cid,
                message_id: nanoid(),
            }))

        const autoExpire = ({ key, message, delivery }) => {
            const { ttl } = message
            const conclude = ({ onError }) => onError(requestTimedOut(key, ttl))
            const drop = () => dropRequest(key)
            const settle = () => () => delivery.update(true)
            const expire = () =>
                Promise.resolve(key)
                    .then(inspect('Expiring request [%s]'))
                    .then(lookupRequest)
                    .then(conclude, settle)
                    .then(drop)

            storeTimeout(key, setTimeout(expire, ttl))
        }

        const send = (payload) =>
            new Promise((onSuccess, onError) => {
                const key = nanoid()

                messageOf(key, payload)
                    .then(inspect('Sending message %o'))
                    .then((message) => ({ message, delivery: sender.send(message) }))
                    .then((receipt) => storeRequest({ key, onSuccess, onError, ...receipt }))
                    .then(autoExpire)
            })

        return { send, sender, receiver }
    }

    return { openDialog }
}
