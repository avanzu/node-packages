const { nanoid } = require('nanoid/index.cjs')
const { init } = require('./state')

const useEntity = (initializer = init) => {
    const makeState = (snapshot) => ({
        ...initializer(),
        ...snapshot,
    })

    const fromSnapshot = (snapshot) => ({
        events: [],
        revision: -1,
        id: snapshot.id,
        state: makeState(snapshot),
    })

    const create = (snapshot) => fromSnapshot({ id: nanoid(), ...snapshot })

    const generate = (snapshot = {}) => new Promise((Ok) => Ok(create(snapshot)))

    return {
        create,
        generate,
        fromSnapshot,
    }
}

exports.useEntity = useEntity
