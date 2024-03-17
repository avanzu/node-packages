const internals = new Map()

module.exports = () => {
    const store = internals.set.bind(internals)
    const lookup = internals.get.bind(internals)
    const drop = internals.delete.bind(internals)
    const exists = internals.has.bind(internals)

    return { store, lookup, drop, exists }
}
