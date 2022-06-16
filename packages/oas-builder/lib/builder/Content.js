const { valueOf } = require('../util')

const defaults = () => ({})
const Schema = (state = {}) => ({
    valueOf: () => valueOf(state),
    raw: (raw) => Schema({ ...state, ...raw }),
    schema: (schema) => Schema({ ...state, schema }),
    example: (example) => Schema({ ...state, example }),
})

exports.defaults = defaults
exports.Schema = Schema
exports.new = () => Schema(defaults())
