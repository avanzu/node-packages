const { mutate } = require('./mutations')
const { useEntity } = require('./entity')
const { tap } = require('ramda')

exports.useStore = (app, crud, context) => {
    const { create } = useEntity()

    const reconstitute = ({ id, state, events, revision }) =>
        new Promise((Ok) => {
            const entity = create({ id, ...state })

            entity.state = events.reduce(mutate, entity.state)
            entity.revision = revision

            Ok(entity)
        })

    const emitEvents = tap(({ events }) =>
        events.forEach((event) => app.emit(event.eventType, event.data))
    )
    const clearEvents = (data) => ({ ...data, events: [] })

    const loadEntity = (id) =>
        new Promise((Ok, Err) => {
            crud.load(id, context).then(reconstitute).then(Ok, Err)
        })

    const saveEntity = (entity) =>
        new Promise((Ok, Err) => {
            crud.save({ ...entity, context })
                .then(emitEvents)
                .then(clearEvents)
                .then(reconstitute)
                .then(Ok, Err)
        })

    const removeEntity = (entity) =>
        new Promise((Ok, Err) => {
            const { id } = entity
            crud.remove(id, context)
                .then(() => entity)
                .then(Ok, Err)
        })

    return { loadEntity, saveEntity, removeEntity }
}
