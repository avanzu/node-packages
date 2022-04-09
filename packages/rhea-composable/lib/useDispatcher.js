const { either, prop, applyTo, pipe } = require('ramda')
const { undeliverable, panic, processFault } = require('./errors')

const subjectOrBody = either(prop('subject'), prop('body'))

const fromNullable = (value, otherwise) =>
    new Promise((Ok, Fail) => (value == null ? Fail(otherwise) : Ok(value)))

module.exports = (dispatchTable) => {
    const matchCallable = (key) =>
        fromNullable(
            prop(key, dispatchTable),
            undeliverable(`Message ${key} cannot be processed here.`)
        )

    const findCallable = pipe(subjectOrBody, matchCallable)

    const runWith = (message) => (callable) =>
        Promise.resolve(callable).then(applyTo(message)).catch(pipe(processFault, panic))

    const dispatch = (context) => findCallable(context.message).then(runWith(context))

    return { matchCallable, findCallable, dispatch }
}
