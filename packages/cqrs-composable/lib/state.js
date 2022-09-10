const { mergeDeepRight } = require('ramda')
// -------------------------------------------------------------------- REGISTRY
const states = new Set()
// --------------------------------------------------------------------- PRIVATE

// ---------------------------------------------------------------------- PUBLIC
const addState = (state) => states.add(state)

const init = () => [...states].reduce(mergeDeepRight, {})

// --------------------------------------------------------------------- EXPORTS

module.exports = {
    addState,
    init,
}
