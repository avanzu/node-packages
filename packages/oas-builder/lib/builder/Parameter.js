const { valueOf } = require('../util')

const defaults = () => ({ in: 'query', schema: { type: 'string' } })
const Schema = (state = {}) => ({
    valueOf: () => valueOf(state),
    raw: (raw) => Schema({ ...state, ...raw }),
    name: (name) => Schema({ ...state, name }),
    description: (...description) => Schema({ ...state, description: description.join('\n') }),
    optional: () => Schema({ ...state, reqiured: false }),
    required: () => Schema({ ...state, required: true }),
    deprecated: () => Schema({ ...state, deprecated: true }),
    mandatory: (flag) => Schema({ ...state, required: flag }),
    inQuery: () => Schema({ ...state, in: 'query' }),
    inPath: () => Schema({ ...state, in: 'path' }),
    inHeader: () => Schema({ ...state, in: 'header' }),
    inCookie: () => Schema({ ...state, in: 'cookie' }),
    schema: (schema) => Schema({ ...state, schema }),
    example: (example) => Schema({ ...state, example }),
})

exports.defaults = defaults
exports.Schema = Schema
exports.new = () => Schema(defaults())
