import { valueOf } from '../util'
import { Map } from './Collections'

const defaults = () => ({ flows: Map() })

export type TSecrityScheme = {
    valueOf: () => any,
    name: (name) => TSecrityScheme,
    typeApiKey: (name, place) => TSecrityScheme,
    typeHttp: (bearerFormat) => TSecrityScheme,
    typeMTLS: () => TSecrityScheme,
    typeOAuth2: () => TSecrityScheme,
    typeOpenId: (openIdConnectUrl) => TSecrityScheme,
    inQuery: () => TSecrityScheme,
    inHeader: () => TSecrityScheme,
    inCookie: () => TSecrityScheme,
    scheme: (scheme) => TSecrityScheme,
    bearerFormat: (bearerFormat) => TSecrityScheme,
    flow: (name, flow) => TSecrityScheme,

}

const Schema = (state: any = {}) => ({
    valueOf: () => valueOf(state),
    name: (name) => Schema({ ...state, name }),
    typeApiKey: (name, place) => Schema({ ...state, type: 'apiKey', name, in: place }),
    typeHttp: (bearerFormat) => Schema({ ...state, type: 'http', bearerFormat }),
    typeMTLS: () => Schema({ ...state, type: 'mutualTLS' }),
    typeOAuth2: () => Schema({ ...state, type: 'oauth2' }),
    typeOpenId: (openIdConnectUrl) => Schema({ ...state, type: 'openIdConnect', openIdConnectUrl }),
    inQuery: () => Schema({ ...state, in: 'query' }),
    inHeader: () => Schema({ ...state, in: 'header' }),
    inCookie: () => Schema({ ...state, in: 'cookie' }),
    scheme: (scheme) => Schema({ ...state, scheme }),
    bearerFormat: (bearerFormat) => Schema({ ...state, bearerFormat }),
    flow: (name, flow) => Schema({ ...state, flows: state.flows.add(name, flow) }),
})
export default {
    defaults,
    Schema,
    new: (): TSecrityScheme => Schema(defaults())
}