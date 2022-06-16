const { valueOf } = require('../util')
const { Map } = require('./Collections')

const defaults = () => ({
    schemas: Map(),
    responses: Map(),
    parameters: Map(),
    examples: Map(),
    requestBodies: Map(),
    headers: Map(),
    securitySchemes: Map(),
    links: Map(),
    callbacks: Map(),
    pathItems: Map(),
})
const Schema = (state = {}) => ({
    valueOf: () => valueOf(state),
    schema: (name, schema) => Schema({ ...state, schemas: state.schemas.add(name, schema) }),
    response: (name, response) =>
        Schema({ ...state, responses: state.responses.add(name, response) }),
    parameter: (name, parameter) =>
        Schema({ ...state, parameters: state.parameters.add(name, parameter) }),
    example: (name, example) => Schema({ ...state, examples: state.examples.add(name, example) }),
    requestBody: (name, requestBody) =>
        Schema({ ...state, requestBodies: state.requestBodies.add(name, requestBody) }),
    header: (name, header) => Schema({ ...state, headers: state.headers.add(name, header) }),
    securityScheme: (name, securityScheme) =>
        Schema({ ...state, securitySchemes: state.securitySchemes.add(name, securityScheme) }),
    link: (name, link) => Schema({ ...state, links: state.links.add(name, link) }),
    callback: (name, callback) =>
        Schema({ ...state, callbacks: state.callbacks.add(name, callback) }),
    pathItem: (name, pathItem) =>
        Schema({ ...state, pathItems: state.pathItems.add(name, pathItem) }),
})

exports.defaults = defaults
exports.Schema = Schema
exports.new = () => Schema(defaults())
