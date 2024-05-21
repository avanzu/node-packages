// -------------------------------------------------------------------- REGISTRY
const mutations = new Map()
// --------------------------------------------------------------------- PRIVATE
const noop = (state) => state

// ---------------------------------------------------------------------- PUBLIC

const addMutation = (name, fn) => mutations.set(name, fn)

const addMutations = (mutations) =>
    Object.entries(mutations).forEach(([name, fn]) => addMutation(name, fn))

const mutationExists = (name) => mutations.has(name)

const getMutation = (name) => (mutationExists(name) ? mutations.get(name) : noop)

const mutate = (state, { eventType, data }, context) =>
    getMutation(eventType).call(null, state, data, context)

// --------------------------------------------------------------------- EXPORTS

module.exports = {
    addMutations,
    addMutation,
    mutationExists,
    getMutation,
    mutate,
}
