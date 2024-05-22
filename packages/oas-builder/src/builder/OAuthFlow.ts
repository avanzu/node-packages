import { valueOf } from '../util'
import { Map } from './Collections'

const defaults = () => ({ scopes: Map() })

export type TOAuthFlow = {
    valueOf: () => any
    authorizationUrl: (authorizationUrl) => TOAuthFlow
    tokenUrl: (tokenUrl) => TOAuthFlow
    refreshUrl: (refreshUrl) => TOAuthFlow
    scope: (name, value) => TOAuthFlow
}

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
    new: (): TOAuthFlow => Schema(defaults()),
}
