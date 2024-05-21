import { valueOf } from '../util'
import { Map } from './Collections'

const defaults = () => ({ scopes: Map() })
const Schema = (state: any = {}) => ({
    valueOf: () => valueOf(state),
    authorizationUrl: (authorizationUrl) => Schema({ ...state, authorizationUrl }),
    tokenUrl: (tokenUrl) => Schema({ ...state, tokenUrl }),
    refreshUrl: (refreshUrl) => Schema({ ...state, refreshUrl }),
    scope: (name, value) =>
        Schema({ ...state, scopes: state.scopes.add(name, value ? value : name) }),
})
export default {
    defaults,
    Schema,
    new: () => Schema(defaults())
}
