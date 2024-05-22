import { valueOf } from '../util'

const defaults = () => ({})
export type TServer = {
    valueOf: () => any,
    raw: (raw) => TServer,
    url: (url) => TServer,
    description: (...description) => TServer,

}
const Schema = (state = {}) => ({
    valueOf: () => valueOf(state),
    raw: (raw) => Schema({ ...state, ...raw }),
    url: (url) => Schema({ ...state, url }),
    description: (...description) => Schema({ ...state, description: description.join('\n') }),
})
export default {
    defaults,
    Schema,
    new: (): TServer => Schema(defaults())
}