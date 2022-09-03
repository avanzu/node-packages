const { valueOf, toValue } = require('../util')
const { Map, List } = require('./Collections')
const Status = require('./StatusCodes')
const Body = require('./Body')
const Parameter = require('./Parameter')

const { toPairs, pipe, pathOr, includes, curry } = require('ramda')
const propsOf = pipe(toValue, pathOr({}, ['properties']), toPairs)
const isRequired = (name, schema) => pipe(toValue, pathOr([], ['required']), includes(name))(schema)

const IdPath = (name, schema, description) =>
    Parameter.new().inPath().required().name(name).schema(schema).description(description)

const buildParam = curry((schema, [name, type]) =>
    Parameter.new().inQuery().name(name).schema(type).mandatory(isRequired(name, schema))
)

const addParam = (acc, param) => ({ ...acc, parameters: acc.parameters.add(param) })

const defaultTo = (description) => Body.new().description(description)

const defaults = () => ({ responses: Map(), parameters: List(), security: List(), tags: [] })
const Schema = (state = {}) => ({
    valueOf: () => valueOf(state),
    raw: (raw) => Schema({ ...state, ...raw }),
    id: (operationId) => Schema({ ...state, operationId }),
    security: (name, ...scopes) =>
        Schema({ ...state, security: state.security.add({ [name]: scopes }) }),
    summary: (summary) => Schema({ ...state, summary }),
    description: (...description) => Schema({ ...state, description: description.join('\n') }),
    deprecated: () => Schema({ ...state, deprecated: true }),

    tag: (tag) => Schema({ ...state, tags: [...state.tags, tag] }),
    tags: (tags) => Schema({ ...state, tags: [...state.tags, ...tags] }),

    request: (requestBody) => Schema({ ...state, requestBody }),
    responses: (responses) => Schema({ ...state, responses: state.responses.merge(responses) }),
    response: (status, body) => Schema({ ...state, responses: state.responses.add(status, body) }),
    parameter: (param) => Schema({ ...state, parameters: state.parameters.add(param) }),

    // shorthands
    idPath: (name, description = '', type = 'string') =>
        Schema({ ...state, parameters: state.parameters.add(IdPath(name, { type }, description)) }),
    query: (schema) => Schema(propsOf(schema).map(buildParam(schema)).reduce(addParam, state)),

    default: (body = defaultTo('NotImplemented')) =>
        Schema({ ...state, responses: state.responses.add('default', body) }),

    // response types
    Ok: (body) => Schema({ ...state, responses: state.responses.add(Status.OK, body) }),
    Created: (body) => Schema({ ...state, responses: state.responses.add(Status.Created, body) }),
    Accepted: (body) => Schema({ ...state, responses: state.responses.add(Status.Accepted, body) }),
    NoContent: (body = defaultTo('NoContent')) =>
        Schema({ ...state, responses: state.responses.add(Status.NoContent, body) }),
    ResetContent: (body = defaultTo('ResetContent')) =>
        Schema({ ...state, responses: state.responses.add(Status.ResetContent, body) }),
    // 4xx range
    BadRequest: (body = defaultTo('BadRequest')) =>
        Schema({ ...state, responses: state.responses.add(Status.BadRequest, body) }),
    Unauthorized: (body = defaultTo('Unauthorized')) =>
        Schema({ ...state, responses: state.responses.add(Status.Unauthorized, body) }),
    Forbidden: (body = defaultTo('Forbidden')) =>
        Schema({ ...state, responses: state.responses.add(Status.Forbidden, body) }),
    NotFound: (body = defaultTo('NotFound')) =>
        Schema({ ...state, responses: state.responses.add(Status.NotFound, body) }),
    MethodNotAllowed: (body = defaultTo('MethodNotAllowed')) =>
        Schema({ ...state, responses: state.responses.add(Status.MethodNotAllowed, body) }),
    NotAcceptable: (body = defaultTo('NotAcceptable')) =>
        Schema({ ...state, responses: state.responses.add(Status.NotAcceptable, body) }),
    RequestTimeout: (body = defaultTo('RequestTimeout')) =>
        Schema({ ...state, responses: state.responses.add(Status.RequestTimeout, body) }),
    Conflict: (body = defaultTo('Conflict')) =>
        Schema({ ...state, responses: state.responses.add(Status.Conflict, body) }),
    Unprocessable: (body = defaultTo('Unprocessable')) =>
        Schema({ ...state, responses: state.responses.add(Status.Unprocessable, body) }),

    // 5xx range
    GeneralError: (body = defaultTo('GeneralServerError')) =>
        Schema({ ...state, responses: state.responses.add(Status.GeneralError, body) }),
    NotImplemented: (body = defaultTo('NotImplemented')) =>
        Schema({ ...state, responses: state.responses.add(Status.NotImplemented, body) }),
    BadGateway: (body = defaultTo('BadGateway')) =>
        Schema({ ...state, responses: state.responses.add(Status.BadGateway, body) }),
    ServiceUnavailable: (body = defaultTo('ServiceUnavailable')) =>
        Schema({ ...state, responses: state.responses.add(Status.ServiceUnavailable, body) }),
    GatewayTimeout: (body = defaultTo('GatewayTimeout')) =>
        Schema({ ...state, responses: state.responses.add(Status.GatewayTimeout, body) }),
})

exports.defaults = defaults
exports.Schema = Schema
exports.new = (summary, id) => Schema({ ...defaults(), summary, id })
