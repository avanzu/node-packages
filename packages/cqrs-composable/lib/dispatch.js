const { getCommand } = require('./commands')
const { mutate } = require('./mutations')

const useDispatch = (context) => {
    const commit = (entity) => (eventType, data) => {
        const event = { eventType, data }
        entity.state = mutate(entity.state, event, context)
        entity.events.push(event)
    }

    const dispatch = (name, data) => (entity) =>
        new Promise((Ok, Err) => {
            const committable = { state: entity.state, commit: commit(entity) }
            getCommand(name)
                .then((command) => command.execute(committable, data, context))
                .then(() => entity)
                .then(Ok, Err)
        })

    const dispatchOn = (entity, name, data) => dispatch(name, data)(entity)

    const dispatchMap = (name, fn) => (entity) =>
        Promise.resolve(entity.state)
            .then(fn)
            .then((data) => dispatch(name, data))
            .then((callable) => callable(entity))

    return { dispatch, dispatchMap, dispatchOn, mutate }
}

exports.useDispatch = useDispatch
