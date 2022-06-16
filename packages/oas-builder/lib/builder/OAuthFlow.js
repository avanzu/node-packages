const { valueOf } = require('../util')
const { Map } = require('./Collections')

const defaults = () => ({ scopes: Map() })
const Schema = (state = {}) => ({
    valueOf: () => valueOf(state),
    authorizationUrl: (authorizationUrl) => Schema({ ...state, authorizationUrl }),
    tokenUrl: (tokenUrl) => Schema({ ...state, tokenUrl }),
    refreshUrl: (refreshUrl) => Schema({ ...state, refreshUrl }),
    scope: (name, value) =>
        Schema({ ...state, scopes: state.scopes.add(name, value ? value : name) }),
})

exports.defaults = defaults
exports.Schema = Schema
exports.new = () => Schema(defaults())
