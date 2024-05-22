import { valueOf } from '../util'

const defaults = () => ({})
export type TTag = {
    valueOf: () => any,
    name: (name) => TTag,
    description: (...description) => TTag,

}
const Schema = (state = {}) => ({
    valueOf: () => valueOf(state),
    name: (name) => Schema({ ...state, name }),
    description: (...description) => Schema({ ...state, description: description.join('\n') }),
})


export default {
    defaults,
    Schema,
    new: (): TTag => Schema(defaults())
}