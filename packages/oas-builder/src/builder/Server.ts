import { valueOf } from '../util'

const defaults = () => ({})
const Schema = (state = {}) => ({
    valueOf: () => valueOf(state),
    raw: (raw) => Schema({ ...state, ...raw }),
    url: (url) => Schema({ ...state, url }),
    description: (...description) => Schema({ ...state, description: description.join('\n') }),
})
export default {
    defaults,
    Schema,
    new: () => Schema(defaults())
}