const { valueOf } = require('../util')

const defaults = () => ({ title: 'New project', version: '1.0.0' })

const Schema = (state = {}) => ({
    title: (title) => Schema({ ...state, title }),
    summary: (summary) => Schema({ ...state, summary }),
    description: (description) => Schema({ ...state, description }),
    terms: (termsOfService) => Schema({ ...state, termsOfService }),
    version: (version) => Schema({ ...state, version }),
    valueOf: () => valueOf(state),
    raw: (raw) => Schema({ ...state, ...raw }),
})

exports.defaults = defaults
exports.Schema = Schema
exports.new = () => Schema(defaults())
