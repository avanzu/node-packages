import OAS, { TOperation } from '@avanzu/oas-builder'
import { Type } from '@sinclair/typebox'
import { getReasonPhrase } from 'http-status-codes'
import path from 'node:path'
import {
    getErrorCodes,
    getErrorSchema,
    getInfo,
    getParamSchema,
    getQuerySchema,
    getRequestSchema,
    getResponseSchema,
    getSimpleQuerySchema,
} from '~/decorators/docs'
import type { DocumentorContext } from '~/decorators/docs'
import { ErrorCodes } from '~/errors'

function ErrorSchema(statusCode: number) {
    return Type.Object({
        errorCode: Type.Enum(ErrorCodes),
        statusCode: Type.Literal(statusCode),
        reason: Type.Literal(getReasonPhrase(statusCode)),
        message: Type.String(),
        details: Type.Record(Type.String(), Type.Any()),
    })
}

export abstract class AbstractDocumentor {
    protected createRoute(context: DocumentorContext) {
        const route = path.join(
            context.info.namespace || '',
            context.mountpoint.prefix || '',
            context.endpoint.route
        )

        return route.replace(/:([^\/]+)/g, '{$1}')
    }

    protected createOperationId(context: DocumentorContext) {
        const methodName = context.endpoint.method.toString()
        const controllerClassName = context.endpoint.target.prototype.constructor.name

        const controllerName = controllerClassName.replace(/Controller$/, '')
        const firstCapital = methodName.match(/[A-Z]/)?.index || -1

        return `${methodName.slice(0, firstCapital)}${controllerName}${methodName.slice(firstCapital)}`
    }

        protected addQuerySchema(operation: TOperation, context: DocumentorContext) {
        const query = getSimpleQuerySchema(context.endpoint.target, context.endpoint.method)
        if( null == query) return operation
        const schema = query()
        for(const [name, type] of Object.entries(schema)) {
            operation = operation.parameter(OAS.param().inQuery().name(name).schema(type))
        }
        return operation
    }

    protected addInfo(operation: TOperation, context: DocumentorContext) {
        const info = getInfo(context.endpoint.target, context.endpoint.method)
        if(null == info) return operation
        const { summary, description } = info()
        return operation.summary(summary).description(description)
    }

    protected addParams(operation: TOperation, context: DocumentorContext) {
        const schema = getParamSchema(context.endpoint.target, context.endpoint.method)
        if (null == schema) return operation
        for (const [name, type] of Object.entries(schema())) {
            operation = operation.parameter(OAS.param().inPath().name(name).schema(type))
        }
        return operation
    }

    protected addQuery(operation: TOperation, context: DocumentorContext) {
        const query = getQuerySchema(context.endpoint.target, context.endpoint.method)
        if (null == query) return operation
        const schemaProvider = context.container.build(query())
        for (const [name, type] of Object.entries(schemaProvider)) {
            operation = operation.parameter(OAS.param().inQuery().name(name).schema(type))
        }
        return operation
    }

    protected addRequestSchema(operation: TOperation, context: DocumentorContext) {
        const schema = getRequestSchema(context.endpoint.target, context.endpoint.method)
        if (null == schema) return operation
        const content = OAS.content().schema(schema())
        const body = OAS.body().json(content)
        return operation.request(body)
    }

    protected addResponseSchema(operation: TOperation, context: DocumentorContext) {
        const schema = getResponseSchema(context.endpoint.target, context.endpoint.method)
        if (null == schema) return operation
        const schemValue = schema()
        for (const [status, definition] of Object.entries(schemValue)) {
            const content = OAS.content().schema(definition)
            const body = OAS.body().description(getReasonPhrase(status)).json(content)
            operation = operation.response(status, body)
        }
        return operation
    }

    protected addErrorCodes(operation: TOperation, context: DocumentorContext) {
        const codes = getErrorCodes(context.endpoint.target, context.endpoint.method)
        if (null == codes) return operation
        const codeValues = codes()
        for (const status of codeValues) {
            const content = OAS.content().schema(ErrorSchema(status))
            const body = OAS.body().description(getReasonPhrase(status)).json(content)
            operation = operation.response(status, body)
        }
        return operation
    }

    protected addErrorSchema(operation: TOperation, context: DocumentorContext) {
        const schema = getErrorSchema(context.endpoint.target, context.endpoint.method)
        if (null == schema) return operation
        const schemValue = schema()
        for (const [status, definition] of Object.entries(schemValue)) {
            const content = OAS.content().schema(definition)
            const body = OAS.body().description(getReasonPhrase(status)).json(content)
            operation = operation.response(status, body)
        }
        return operation
    }

    protected addTag(operation: TOperation, context: DocumentorContext) {
        if (null == context.opts.tag) return operation
        return operation.tag(context.opts.tag.name)
    }
}
