import { valueOf } from '../util'

const defaults = () => ({})
const Schema = (state: any = {}) => ({
    valueOf: () => valueOf(state),
    summary: (summary) => Schema({ ...state, summary }),
    description: (...description) => Schema({ ...state, description: description.join('\n') }),
    value: (value) => Schema({ ...state, value }),
    externalValue: (externalValue) => Schema({ ...state, externalValue }),
    raw: (raw) => Schema({ ...state, ...raw }),
})

export default {
    defaults,
    Schema,
    new: () => Schema(defaults())
}
