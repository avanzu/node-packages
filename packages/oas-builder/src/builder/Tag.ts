import { valueOf } from '../util'

const defaults = () => ({})
const Schema = (state = {}) => ({
    valueOf: () => valueOf(state),
    name: (name) => Schema({ ...state, name }),
    description: (...description) => Schema({ ...state, description: description.join('\n') }),
})
export default {
    defaults,
    Schema,
    new: () => Schema(defaults())
}