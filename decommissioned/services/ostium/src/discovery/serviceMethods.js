const { NotImplemented } = require('@feathersjs/errors')
module.exports = () => {
    const actions = new Map()

    const action = (name, args) =>
        new Promise((resolve, reject) =>
            actions.has(name)
                ? resolve(actions.get(name).apply(null, args))
                : reject(new NotImplemented(`Action ${name} is not implemented`))
        )

    const acceptAction = (name, callable) => actions.set(name, callable)
    const dismissAction = (name) => actions.delete(name)

    const methods = {
        find: (...args) => action('find', args),
        get: (...args) => action('get', args),
        update: (...args) => action('update', args),
        patch: (...args) => action('patch', args),
        create: (...args) => action('create', args),
        remove: (...args) => action('remove', args),
        acceptAction,
        rejectAction: dismissAction,
    }

    return { methods, acceptAction, dismissAction }
}
