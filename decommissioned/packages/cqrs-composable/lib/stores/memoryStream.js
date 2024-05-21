const { notFound } = require('../errors')

const streams = new Map()

exports.load = (id) =>
    new Promise((Ok, Err) => {
        const stream = streams.get(id) || []
        streams.has(id)
            ? Ok({ id, state: {}, events: stream, revision: stream.length })
            : Err(notFound(`Entity stream for "${id}" not found.`))
    })

exports.save = ({ id, state, events }) =>
    new Promise((Ok) => {
        const stream = (streams.get(id) || []).concat(events)
        streams.set(id, stream)
        Ok({ id, state, events, revision: stream.length })
    })

exports.remove = (id) =>
    new Promise((Ok) => {
        streams.delete(id)
        Ok()
    })
exports.exists = (id) => streams.has(id)
