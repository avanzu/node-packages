import { valueOf } from '../util'
import { TBody } from './Body'
import { Map } from './Collections'
import { TExample } from './Example'
import { THeader } from './Header'
import { TParameter } from './Parameter'
import { TSecrityScheme } from './SecurityScheme'

export const defaults = () => ({
    schemas: Map(),
    responses: Map(),
    parameters: Map(),
    examples: Map(),
    requestBodies: Map(),
    headers: Map(),
    securitySchemes: Map(),
    links: Map(),
    callbacks: Map(),
    pathItems: Map(),
})
export const Schema = (state: any = {}) => ({
    valueOf: () => valueOf(state),
    schema: (name: string, schema: any) => Schema({ ...state, schemas: state.schemas.add(name, schema) }),
    response: (name, response: TBody) =>
        Schema({ ...state, responses: state.responses.add(name, response) }),
    parameter: (name, parameter: TParameter) =>
        Schema({ ...state, parameters: state.parameters.add(name, parameter) }),
    example: (name, example: TExample) => Schema({ ...state, examples: state.examples.add(name, example) }),
    requestBody: (name, requestBody: TBody) =>
        Schema({ ...state, requestBodies: state.requestBodies.add(name, requestBody) }),
    header: (name, header: THeader) => Schema({ ...state, headers: state.headers.add(name, header) }),
    securityScheme: (name, securityScheme: TSecrityScheme) =>
        Schema({ ...state, securitySchemes: state.securitySchemes.add(name, securityScheme) }),
    link: (name, link) => Schema({ ...state, links: state.links.add(name, link) }),
    callback: (name, callback) =>
        Schema({ ...state, callbacks: state.callbacks.add(name, callback) }),
    pathItem: (name, pathItem) =>
        Schema({ ...state, pathItems: state.pathItems.add(name, pathItem) }),
})

export type TComponents = ReturnType<typeof Schema>

export default {
    defaults,
    Schema,
    new: (): TComponents => Schema(defaults())
}
