const { notFound } = require('../errors')

const states = new Map()

exports.load = (id) =>
    new Promise((Ok, Err) => {
        states.has(id)
            ? Ok({ id, events: [], ...states.get(id) })
            : Err(notFound(`Entity state for "${id}" not found.`))
    })

exports.save = ({ id, state, events, revision }) =>
    new Promise((Ok) => {
        states.set(id, { state, revision: revision + (events || []).length })
        Ok({ id, events, ...states.get(id) })
    })
exports.remove = (id) =>
    new Promise((Ok) => {
        states.delete(id)
        Ok()
    })

exports.exists = (id) => states.has(id)
