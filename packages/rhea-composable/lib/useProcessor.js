const { debug, inspect } = require('./inspect')('useProcessor')
const { ReceiverEvents } = require('rhea')
const { undeliverable, panic, processFault } = require('./errors')
const { either, prop, applyTo, pipe } = require('ramda')
const { nanoid } = require('nanoid')
const useReceiver = require('./useReceiver')

const subjectOrBody = either(prop('subject'), prop('body'))
const fromNullable = (value, otherwise) =>
    new Promise((Ok, Fail) => (value == null ? Fail(otherwise) : Ok(value)))

module.exports = (connection) => {
    const processMessages = (topic, dispatchTable) => {
        const { openReceiver, oneUp, allDone, noLuck } = useReceiver()

        const receiver = openReceiver(connection, topic)

        const matchCallable = (key) =>
            fromNullable(
                prop(key, dispatchTable),
                undeliverable(`Message ${key} cannot be processed here.`)
            )

        const onMessage = (context) => {
            const { message, delivery, connection } = context
            const { correlation_id, reply_to } = message
            debug('Message %s received %o', correlation_id, message)

            const messageOf = (payload) => ({
                ...payload,
                correlation_id,
                to: reply_to,
                message_id: nanoid(),
            })

            const respondTo = (payload) => connection.send(messageOf(payload))

            // const allDone = () => delivery.update(true)
            // const noLuck = ({ conclude }) => conclude(delivery)
            // const oneUp = () => receiver.add_credit(1)

            const findCallable = pipe(subjectOrBody, matchCallable)

            const runWith = (message) => (callable) =>
                Promise.resolve(callable).then(applyTo(message)).catch(pipe(processFault, panic))

            findCallable(message)
                .then(runWith(context))
                .then(inspect('Responding with %o'))
                .then(respondTo)
                .then(allDone(delivery), noLuck(delivery))
                .then(oneUp(receiver))
        }

        receiver.on(ReceiverEvents.message, onMessage)

        return receiver
    }

    return { processMessages }
}
