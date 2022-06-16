const { valueOf } = require('../util')

const defaults = () => ({})
const Schema = (state = {}) => ({
    valueOf: () => valueOf(state),
    name: (name) => Schema({ ...state, name }),
    description: (description) => Schema({ ...state, description }),
})

exports.defaults = defaults
exports.Schema = Schema
exports.new = () => Schema(defaults())
