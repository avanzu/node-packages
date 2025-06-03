import { GenricDocumentor, DocumentorContext, EndpointInfo } from '~/decorators'
import { AbstractDocumentor } from './abstractDocumentor'
import OAS, { content } from '@avanzu/oas-builder'

export class ControllerDocumentor extends AbstractDocumentor implements GenricDocumentor {
    kind: 'generic' = 'generic'
    getInfo(context: DocumentorContext): EndpointInfo {
        const route = this.createRoute(context)
        const operationId = this.createOperationId(context)

        let operation = OAS.operation().id(operationId)
        operation = this.addInfo(operation, context)
        operation = this.addQuery(operation, context)
        operation = this.addQuerySchema(operation, context)
        operation = this.addParams(operation, context)
        operation = this.addRequestSchema(operation, context)
        operation = this.addResponseSchema(operation, context)
        operation = this.addErrorCodes(operation, context)
        operation = this.addErrorSchema(operation, context)
        operation = this.addTag(operation, context)

        const path = OAS.path().method(context.endpoint.verb, operation)
        return { route, path, operationId, verb :context.endpoint.verb, operation }
    }
}
