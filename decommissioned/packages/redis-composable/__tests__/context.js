module.exports = () => {
    const state = new Map()
    const teardowns = new Set()

    const store = (key, value) => state.set(key, value)
    const lookup = (key) => state.get(key)
    const drop = (key) => state.delete(key)
    const onTearDown = (callable) => teardowns.add(callable)
    const tearDown = (onError = console.error) =>
        [...teardowns].reduce((p, fn) => p.then(fn, onError), Promise.resolve())

    return { store, lookup, drop, onTearDown, tearDown }
}
