const { valueOf } = require('../util')

const defaults = () => ({})
const Schema = (state = {}) => ({
    valueOf: () => valueOf(state),
    to: ($ref) => Schema({ ...state, $ref }),
    schema: (name) => Schema({ ...state, $ref: `#/components/schemas/${name}` }),
    response: (name) => Schema({ ...state, $ref: `#/components/responses/${name}` }),
    param: (name) => Schema({ ...state, $ref: `#/components/parameters/${name}` }),
    body: (name) => Schema({ ...state, $ref: `#/components/requestBodies/${name}` }),
    header: (name) => Schema({ ...state, $ref: `#/components/headers/${name}` }),
    security: (name) => Schema({ ...state, $ref: `#/components/securitySchemes/${name}` }),
    link: (name) => Schema({ ...state, $ref: `#/components/links/${name}` }),
    callback: (name) => Schema({ ...state, $ref: `#/components/callbacks/${name}` }),
    pathItem: (name) => Schema({ ...state, $ref: `#/components/pathItems/${name}` }),
})

exports.defaults = defaults
exports.Schema = Schema
exports.new = () => Schema(defaults())
