import { valueOf } from '../util'

const defaults = () => ({ title: 'New project', version: '1.0.0' })

const Schema = (state = {}) => ({
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
    new: () => Schema(defaults())
}
