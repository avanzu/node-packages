const { valueOf } = require('../util')
const { Map } = require('./Collections')

const defaults = () => ({ examples: Map() })
const Schema = (state = {}) => ({
    valueOf: () => valueOf(state),
    raw: (raw) => Schema({ ...state, ...raw }),
    schema: (schema) => Schema({ ...state, schema }),
    example: (example) => Schema({ ...state, example }),
    addExample: (name, example) =>
        Schema({ ...state, examples: state.examples.add(name, example) }),
    examples: (examples) =>
        Schema({
            ...state,
            examples: Object.entries(examples).reduce(
                (acc, [name, value]) => acc.add(name, value),
                state.examples
            ),
        }),
})

exports.defaults = defaults
exports.Schema = Schema
exports.new = () => Schema(defaults())
