import { valueOf } from '../util'

const defaults = () => ({ schema: { type: 'string' } })
const Schema = (state = {}) => ({
    valueOf: () => valueOf(state),
    raw: (raw) => Schema({ ...state, ...raw }),
    description: (...description) => Schema({ ...state, description: description.join('\n') }),
    optional: () => Schema({ ...state, reqiured: false }),
    required: () => Schema({ ...state, required: true }),
    deprecated: () => Schema({ ...state, deprecated: true }),
    schema: (schema) => Schema({ ...state, schema }),
    example: (example) => Schema({ ...state, example }),
})
export default {
    defaults,
    Schema,
    new: () => Schema(defaults())
}
