import { valueOf } from '../util'

const defaults = () => ({})
export type TRef = {
    valueOf: () => any,
    to: ($ref) => TRef,
    schema: (name) => TRef,
    response: (name) => TRef,
    param: (name) => TRef,
    body: (name) => TRef,
    header: (name) => TRef,
    security: (name) => TRef,
    link: (name) => TRef,
    callback: (name) => TRef,
    pathItem: (name) => TRef,

}
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
export default {
    defaults,
    Schema,
    new: (): TRef => Schema(defaults())
}