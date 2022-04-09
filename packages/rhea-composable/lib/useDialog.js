const { debug, inspect, notice } = require('./inspect')('useDialog')
const { nanoid } = require('nanoid')
const useRequests = require('./useRequests')
const useSender = require('./useSender')
const useReceiver = require('./useReceiver')
const useDelivery = require('./useDelivery')
const useMessage = require('./useMessage')
const useDuplex = require('./useDuplex')

const { ReceiverEvents } = require('rhea')

module.exports = (connection) => {
    const { storeReceipt, autoExpire, useLookup } = useRequests()
    const { openReceiver, oneUp } = useReceiver(connection)
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

        const { messageOf, sendMessage } = useDuplex(receiver, sender)

        const onMesssage = (context) => {
            const { message, delivery } = context
            const { allDone, noLuck } = useDelivery(delivery)
            const { lookupId, lifetime, produceOutcome } = useMessage(message)
            const { retrieve, drop } = useLookup(lookupId())
            debug('Message [%s] with TTL of %sms received', lookupId(), lifetime())

            retrieve()
                .then(notice(`Resolving request [${lookupId()}]`))
                .then(produceOutcome)
                .then(drop)
                .then(allDone, noLuck)
                .then(oneUp(receiver))
        }

        receiver.on(ReceiverEvents.message, onMesssage)

        const send = (payload) =>
            new Promise((onSuccess, onError) => {
                const key = nanoid()

                messageOf(key, payload)
                    .then(inspect('Sending message %o'))
                    .then(sendMessage)
                    .then(storeReceipt(key, onSuccess, onError))
                    .then(autoExpire)
            })

        return { send, sender, receiver }
    }

    return { openDialog }
}
