const Methods = require('./Methods')
const { valueOf } = require('../util')

const defaults = () => ({})
const Schema = (state = {}) => ({
    valueOf: () => valueOf(state),
    raw: (raw) => Schema({ ...state, ...raw }),
    summary: (summary) => Schema({ ...state, summary }),
    description: (description) => Schema({ ...state, description }),
    get: (value) => Schema({ ...state, [Methods.GET]: value }),
    put: (value) => Schema({ ...state, [Methods.PUT]: value }),
    post: (value) => Schema({ ...state, [Methods.POST]: value }),
    delete: (value) => Schema({ ...state, [Methods.DELETE]: value }),
    patch: (value) => Schema({ ...state, [Methods.PATCH]: value }),
    method: (method, value) => Schema({ ...state, [method]: value }),
})

exports.defaults = defaults
exports.Schema = Schema
exports.new = () => Schema(defaults())
