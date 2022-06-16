const { valueOf } = require('../util')
const collections = require('./Collections')
const Components = require('./Components')
const defaults = () => ({
    openapi: '3.0.0',
    servers: collections.List(),
    paths: collections.Map(),
    components: Components.new(),
    security: collections.Map(),
    tags: collections.List(),
})

const Schema = (state = {}) => ({
    valueOf: () => valueOf(state),
    raw: (raw) => Schema({ ...state, ...raw }),
    info: (info) => Schema({ ...state, info }),
    server: (server) => Schema({ ...state, servers: state.servers.add(server) }),
    security: (name, value) => Schema({ ...state, security: state.security.add(name, value) }),

    path: (name, path) => Schema({ ...state, paths: state.paths.add(name, path) }),
    paths: (paths) => Schema({ ...state, paths: state.paths.merge(paths) }),

    tag: (tag) => Schema({ ...state, tags: state.tags.add(tag) }),
    tags: (tags) => Schema({ ...state, tags: state.tags.merge(tags) }),

    schema: (name, schema) =>
        Schema({ ...state, components: state.components.schema(name, schema) }),
    response: (name, response) =>
        Schema({ ...state, components: state.components.response(name, response) }),
    parameter: (name, parameter) =>
        Schema({ ...state, components: state.components.parameter(name, parameter) }),
    example: (name, example) =>
        Schema({ ...state, components: state.components.example(name, example) }),
    requestBody: (name, requestBody) =>
        Schema({ ...state, components: state.components.requestBody(name, requestBody) }),
    header: (name, header) =>
        Schema({ ...state, components: state.components.header(name, header) }),
    securityScheme: (name, securityScheme) =>
        Schema({ ...state, components: state.components.securityScheme(name, securityScheme) }),
    link: (name, link) => Schema({ ...state, components: state.components.link(name, link) }),
    callback: (name, callback) =>
        Schema({ ...state, components: state.components.callback(name, callback) }),
    pathItem: (name, pathItem) =>
        Schema({ ...state, components: state.components.pathItem(name, pathItem) }),
})

exports.defaults = defaults
exports.Schema = Schema
exports.new = () => Schema(defaults())
