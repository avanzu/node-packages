import { valueOf } from '../util'

const defaults = () => ({ title: 'New project', version: '1.0.0' })

export type TInfo = {
    title: (title) => TInfo
    summary: (summary) => TInfo
    description: (...description) => TInfo
    terms: (termsOfService) => TInfo
    version: (version) => TInfo
    valueOf: () => any,
    raw: (raw) => TInfo
}

const Schema = (state = {}) : TInfo => ({
    title: (title) => Schema({ ...state, title }),
    summary: (summary) => Schema({ ...state, summary }),
    description: (...description) => Schema({ ...state, description: description.join('\n') }),
    terms: (termsOfService) => Schema({ ...state, termsOfService }),
    version: (version) => Schema({ ...state, version }),
    valueOf: () => valueOf(state),
    raw: (raw) => Schema({ ...state, ...raw }),
})


export default {
    defaults,
    Schema,
    new: () : TInfo => Schema(defaults())
}
