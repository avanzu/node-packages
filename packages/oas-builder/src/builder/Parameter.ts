import { valueOf } from '../util'

const defaults = () => ({ in: 'query', schema: { type: 'string' } })

export type TParameter = {
    valueOf: () => any,
    raw: (raw) => TParameter,
    name: (name) => TParameter,
    description: (...description) => TParameter,
    optional: () => TParameter,
    required: () => TParameter,
    deprecated: () => TParameter,
    mandatory: (flag) => TParameter,
    inQuery: () => TParameter,
    inPath: () => TParameter,
    inHeader: () => TParameter,
    inCookie: () => TParameter,
    schema: (schema) => TParameter,
    example: (example) => TParameter,

}

const Schema = (state = {}) => ({
    valueOf: () => valueOf(state),
    raw: (raw) => Schema({ ...state, ...raw }),
    name: (name) => Schema({ ...state, name }),
    description: (...description) => Schema({ ...state, description: description.join('\n') }),
    optional: () => Schema({ ...state, reqiured: false }),
    required: () => Schema({ ...state, required: true }),
    deprecated: () => Schema({ ...state, deprecated: true }),
    mandatory: (flag) => Schema({ ...state, required: flag }),
    inQuery: () => Schema({ ...state, in: 'query' }),
    inPath: () => Schema({ ...state, in: 'path' }),
    inHeader: () => Schema({ ...state, in: 'header' }),
    inCookie: () => Schema({ ...state, in: 'cookie' }),
    schema: (schema) => Schema({ ...state, schema }),
    example: (example) => Schema({ ...state, example }),
})


export default {
    defaults,
    Schema,
    new: () : TParameter => Schema(defaults())
}
