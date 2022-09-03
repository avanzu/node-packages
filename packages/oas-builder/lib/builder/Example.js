const { valueOf } = require('../util')

const defaults = () => ({})
const Schema = (state = {}) => ({
    valueOf: () => valueOf(state),
    summary: (summary) => Schema({ ...state, summary }),
    description: (...description) => Schema({ ...state, description: description.join('\n') }),
    value: (value) => Schema({ ...state, value }),
    externalValue: (externalValue) => Schema({ ...state, externalValue }),
    raw: (raw) => Schema({ ...state, ...raw }),
})

exports.defaults = defaults
exports.Schema = Schema
exports.new = () => Schema(defaults())
