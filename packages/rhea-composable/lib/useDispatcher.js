const { either, prop, applyTo, pipe, cond, has, T, always } = require('ramda')
const { undeliverable, panic, processFault } = require('./errors')

const subjectOrBody = either(prop('subject'), prop('body'))

const fromCond = (dispatchTable, key, otherwise) =>
    new Promise((resolve, reject) => {
        cond([
            [has(key), pipe(prop(key), resolve)],
            [has('default'), pipe(prop('default'), resolve)],
            [T, pipe(always(otherwise), reject)],
        ])(dispatchTable)
    })

module.exports = (dispatchTable) => {
    const matchCallable = (key) =>
        fromCond(dispatchTable, key, undeliverable(`Message ${key} cannot be processed here.`))

    const findCallable = pipe(subjectOrBody, matchCallable)

    const runWith = (message) => (callable) =>
        Promise.resolve(callable).then(applyTo(message)).catch(pipe(processFault, panic))

    const dispatch = (context) => findCallable(context.message).then(runWith(context))

    return { matchCallable, findCallable, dispatch }
}
