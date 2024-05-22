import { valueOf } from '../util'
import collections from './Collections'
import Components from './Components'
const defaults = () => ({
    openapi: '3.0.0',
    servers: collections.List(),
    paths: collections.Map(),
    components: Components.new(),
    security: collections.Map(),
    tags: collections.List(),
})

export type TDoc = {
    valueOf: () => any
    raw: (raw) => TDoc
    info: (info) => TDoc
    server: (server) => TDoc
    security: (name, value) => TDoc
    path: (name, path) => TDoc
    paths: (paths) => TDoc
    tag: (tag) => TDoc
    tags: (tags) => TDoc
    schema: (name, schema) => TDoc
    response: (name, response) => TDoc
    parameter: (name, parameter) => TDoc
    example: (name, example) => TDoc
    requestBody: (name, requestBody) => TDoc
    header: (name, header) => TDoc
    securityScheme: (name, securityScheme) => TDoc
    link: (name, link) => TDoc
    callback: (name, callback) => TDoc
    pathItem: (name, pathItem) => TDoc
}

const Schema = (state: any = {}) => ({
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

export default {
    defaults,
    Schema,
    new: (): TDoc => Schema(defaults()),
}
