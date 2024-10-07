import 'reflect-metadata'
import type { TPath } from '@avanzu/oas-builder'
import type { Endpoint, MountPoint } from './routing'
import type { InfoBlock } from '~/modules/documentation'
import type { Constructor } from './util'
import { StatusCodes } from 'http-status-codes'
import { Container } from '..'

export type EndpointInfo = {
    route: string
    path: TPath
}

export type DocumentorContext = {
    endpoint: Endpoint
    mountpoint: MountPoint
    info: InfoBlock
    opts: ApiDocsOpts
    container: Container
}

export type CustomDocumentor<Controller = unknown> = {
    [Method in keyof Controller]?: (context: DocumentorContext) => EndpointInfo
} & {
    kind: 'custom'
}

export interface GenricDocumentor<Controller = any> {
    kind: 'generic'
    getInfo(context: DocumentorContext): EndpointInfo
}

export type Documentor = CustomDocumentor | GenricDocumentor

export type RequestDefinition = Record<string, any>
export type ResponseDefinition = Record<string, any>
export type Responses = Partial<Record<StatusCodes, ResponseDefinition>>
export type ErrorStatusCodes = StatusCodes[]

export type ContractInfo = {
    description?: string
    summary?: string
}

export type ContractDefinition = {
    info?: () => ContractInfo
    params?: () => Record<string, any>
    query?: () => Constructor
    request?: () => RequestDefinition
    response?: () => Responses
    errors?: () => Responses
    errorCodes?: () => ErrorStatusCodes
}

export type ApiDocsOpts = {
    tag?: { name: string; description: string }
    generator?: () => Constructor<Documentor>
}

const APIDOCS = Symbol('avanzu.kernel.apidocs.generator')
const PARAMS = Symbol('avanzu.kernel.apidocs.params')
const QUERY = Symbol('avanzu.kernel.apidocs.query')
const REQ = Symbol('avanzu.kernel.apidocs.request')
const RES = Symbol('avanzu.kernel.apidocs.response')
const ERR = Symbol('avanzu.kernel.apidocs.error')
const CODES = Symbol('avanzu.kernel.apidocs.errorcode')
const INFO = Symbol('avanzu.kernel.apidocs.info')

export function ApiDocs(opts: ApiDocsOpts): ClassDecorator {
    return function (target: Object) {
        Reflect.defineMetadata(APIDOCS, opts, target)
    }
}

export function getApiDocs(target: Function): ApiDocsOpts {
    return Reflect.hasMetadata(APIDOCS, target) ? Reflect.getMetadata(APIDOCS, target) : null
}

export function Contract(contract: ContractDefinition): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol) {
        if (contract.params) Reflect.defineMetadata(PARAMS, contract.params, target, propertyKey)
        if (contract.query) Reflect.defineMetadata(QUERY, contract.query, target, propertyKey)
        if (contract.request) Reflect.defineMetadata(REQ, contract.request, target, propertyKey)
        if (contract.response) Reflect.defineMetadata(RES, contract.response, target, propertyKey)
        if (contract.errors) Reflect.defineMetadata(ERR, contract.errors, target, propertyKey)
        if (contract.info) Reflect.defineMetadata(INFO, contract.info, target, propertyKey)
        if (contract.errorCodes)
            Reflect.defineMetadata(CODES, contract.errorCodes, target, propertyKey)
    }
}

export function ParamSchema(params: Record<string, any>): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol) {
        Reflect.defineMetadata(PARAMS, params, target, propertyKey)
    }
}

export function getParamSchema(target: Function, property: string | symbol) {
    return Reflect.getMetadata(PARAMS, target.prototype, property)
}

export function QuerySchema(params: () => Record<string, any>): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol) {
        Reflect.defineMetadata(QUERY, params, target, propertyKey)
    }
}

export function getQuerySchema(target: Function, property: string | symbol) {
    return Reflect.getMetadata(QUERY, target.prototype, property)
}

export function RequestSchema(schema: any): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol) {
        Reflect.defineMetadata(REQ, schema, target, propertyKey)
    }
}

export function getRequestSchema(target: Function, property: string | symbol) {
    return Reflect.getMetadata(REQ, target.prototype, property)
}

export function ResponseSchema(schema: any): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol) {
        Reflect.defineMetadata(RES, schema, target, propertyKey)
    }
}

export function getResponseSchema(target: Function, property: string | symbol) {
    return Reflect.getMetadata(RES, target.prototype, property)
}

export function ErrorSchema(schema: any): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol) {
        Reflect.defineMetadata(ERR, schema, target, propertyKey)
    }
}

export function getErrorSchema(target: Function, property: string | symbol) {
    return Reflect.getMetadata(ERR, target.prototype, property)
}

export function ErrorStatusCodes(codes: ErrorStatusCodes): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol) {
        Reflect.defineMetadata(CODES, codes, target, propertyKey)
    }
}

export function getErrorCodes(target: Function, property: string | symbol) {
    return Reflect.getMetadata(CODES, target.prototype, property)
}

export function Info(info: ContractInfo): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol) {
        Reflect.defineMetadata(INFO, info, target, propertyKey)
    }
}
export function getInfo(target: Function, property: string | symbol) {
    return Reflect.getMetadata(INFO, target.prototype, property)
}
