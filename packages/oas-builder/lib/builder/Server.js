const { valueOf } = require('../util')

const defaults = () => ({})
const Schema = (state = {}) => ({
    valueOf: () => valueOf(state),
    raw: (raw) => Schema({ ...state, ...raw }),
    url: (url) => Schema({ ...state, url }),
    description: (description) => Schema({ ...state, description }),
})

exports.defaults = defaults
exports.Schema = Schema
exports.new = () => Schema(defaults())
