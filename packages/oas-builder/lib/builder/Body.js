const { valueOf } = require('../util')
const { Map } = require('./Collections')
const { JSON, TEXT, XML, ANY } = require('./MediaTypes')
const defaults = () => ({ content: Map(), headers: Map() })
const Schema = (state = {}) => ({
    valueOf: () => valueOf(state),
    raw: (raw) => Schema({ ...state, ...raw }),
    description: (description) => Schema({ ...state, description }),
    required: () => Schema({ ...state, required: true }),
    header: (name, value) => Schema({ ...state, headers: state.headers.add(name, value) }),
    json: (content) => Schema({ ...state, content: state.content.add(JSON, content) }),
    text: (content) => Schema({ ...state, content: state.content.add(TEXT, content) }),
    xml: (content) => Schema({ ...state, content: state.content.add(XML, content) }),
    any: (content) => Schema({ ...state, content: state.content.add(ANY, content) }),
})

exports.defaults = defaults
exports.Schema = Schema
exports.new = () => Schema(defaults())
