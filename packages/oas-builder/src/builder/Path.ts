import Methods from './Methods'
import { valueOf } from '../util'

const defaults = () => ({})
export type TPath = {
    valueOf: () => any,
    raw: (raw) => TPath,
    summary: (summary) => TPath,
    description: (...description) => TPath,
    get: (value) => TPath,
    put: (value) => TPath,
    post: (value) => TPath,
    delete: (value) => TPath,
    patch: (value) => TPath,
    method: (method, value) => TPath,

}
const Schema = (state = {}) => ({
    valueOf: () => valueOf(state),
    raw: (raw) => Schema({ ...state, ...raw }),
    summary: (summary) => Schema({ ...state, summary }),
    description: (...description) => Schema({ ...state, description: description.join('\n') }),
    get: (value) => Schema({ ...state, [Methods.GET]: value }),
    put: (value) => Schema({ ...state, [Methods.PUT]: value }),
    post: (value) => Schema({ ...state, [Methods.POST]: value }),
    delete: (value) => Schema({ ...state, [Methods.DELETE]: value }),
    patch: (value) => Schema({ ...state, [Methods.PATCH]: value }),
    method: (method, value) => Schema({ ...state, [method]: value }),
})


export default {
    defaults,
    Schema,
    new: (): TPath => Schema(defaults())
}
