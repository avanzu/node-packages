const { debug } = require('./inspect')('useProcessor')
const { ReceiverEvents } = require('rhea')
const { isDeliverable } = require('./errors')
const { pipe, when, always } = require('ramda')
const useReceiver = require('./useReceiver')
const useMessage = require('./useMessage')
const useDelivery = require('./useDelivery')
const useDispatcher = require('./useDispatcher')

module.exports = (connection) => {
    const processMessages = (topic, dispatchTable) => {
        const { openReceiver, oneUp } = useReceiver()
        const { dispatch } = useDispatcher(dispatchTable)
        const receiver = openReceiver(connection, topic)

        const onMessage = (context) => {
            const { message, delivery, connection } = context
            const { whenReplyIsExpected, replyOK, replyError } = useMessage(message)
            const { allDone, noLuck } = useDelivery(delivery)

            const maybeReply = whenReplyIsExpected((message) => connection.send(message))

            const sendPositiveReply = replyOK(pipe(maybeReply, allDone))

            const sendNegativeReply = (error) => {
                debug('Attempt reply negatively %o', error)
                pipe(when(isDeliverable, replyError(maybeReply)), always(error), noLuck)(error)
            }

            dispatch(context).then(sendPositiveReply, sendNegativeReply).then(oneUp(receiver))
        }

        receiver.on(ReceiverEvents.message, onMessage)

        return receiver
    }

    return { processMessages }
}
