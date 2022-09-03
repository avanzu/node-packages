const { valueOf } = require('../util')
const { Map } = require('./Collections')

const defaults = () => ({ examples: Map() })
const addExample = (acc, [name, value]) => acc.add(name, value)
const examplesOf = (examples, state) => Object.entries(examples).reduce(addExample, state.examples)

const Schema = (state = {}) => ({
    valueOf: () => valueOf(state),
    raw: (raw) => Schema({ ...state, ...raw }),
    schema: (schema) => Schema({ ...state, schema }),
    example: (example) => Schema({ ...state, example }),
    addExample: (name, example) =>
        Schema({ ...state, examples: addExample(state.examples, [name, example]) }),
    examples: (examples) => Schema({ ...state, examples: examplesOf(examples, state) }),
})

exports.defaults = defaults
exports.Schema = Schema
exports.new = () => Schema(defaults())
