const { debug, inspect } = require('./inspect')('useProcessor')
const { ReceiverEvents } = require('rhea')
const { undeliverable } = require('./errors')
const { either, prop, applyTo, pipe } = require('ramda')

const subjectOrBody = either(prop('subject'), prop('body'))
const fromNullable = (value, otherwise) =>
    new Promise((Ok, Fail) => (value == null ? Fail(otherwise) : Ok(value)))

module.exports = (receiver) => {
    const processMessages = (dispatchTable) => {
        const matchCallable = (key) =>
            fromNullable(
                prop(key, dispatchTable),
                undeliverable(`Message ${key} cannot be processed here.`)
            )

        const onMessage = (context) => {
            const { message, delivery, connection } = context
            const { correlation_id, reply_to } = message
            debug('Message %s received %o', correlation_id, message)

            const respondTo = (payload) =>
                connection.send({ ...payload, correlation_id, to: reply_to })

            const allDone = () => delivery.update(true)
            const noLuck = ({ props }) => delivery.reject(props)

            const findCallable = pipe(subjectOrBody, matchCallable)

            findCallable(message)
                .then(applyTo(context))
                .then(inspect('Responding with %o'))
                .then(respondTo)
                .then(allDone, noLuck)
        }

        receiver.on(ReceiverEvents.message, onMessage)
    }

    return { processMessages }
}
