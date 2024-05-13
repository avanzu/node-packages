import * as Kernel from '@avanzu/kernel'
import { StatusCodes } from 'http-status-codes'
import { Feature, PayloadResolver } from '~/domain'
import { Context } from '../interfaces'

@Kernel.Controller('/features')
export class FeatureController {
    @Kernel.Get('/')
    async list(context: Context): Promise<void> {
        context.body = Kernel.getUseCases().map((info) => info.id)
    }

    @Kernel.All('/:featureId')
    async dispatch(context: Context): Promise<any> {
        let featureId = context.params.featureId
        let featureInfo = Kernel.getUseCase(featureId)
        if (null == featureInfo) {
            context.throw(StatusCodes.NOT_FOUND, `Feature ${featureId} not found`)
        }
        let feature: Feature = context.scope.build(featureInfo.useCase)
        let payload = await this.resolvePayload(featureInfo, context)

        await this.validatePayload(featureInfo, context, payload)

        let result = await feature.invoke(payload)

        context.body = result
    }

    private async validatePayload(
        featureInfo: Kernel.UseCaseInfo,
        context: Context<{}, unknown>,
        payload: unknown
    ) {
        if (false === Boolean(featureInfo.schema)) {
            return
        }
        let validator = context.scope.cradle.validator
        let result = await validator.validate(featureInfo.schema, payload)
        if (true === result.isValid) {
            return
        }
        throw new Kernel.ValidationError(result.errors)
    }

    private async resolvePayload(useCaseInfo: Kernel.UseCaseInfo, context: Context) {
        let payload = context.request.body
        let resolverClass = Kernel.getResolver(useCaseInfo.useCase)
        if (null === resolverClass) return payload
        let resolver: PayloadResolver = context.scope.build(resolverClass)
        payload = await resolver.resolve(context)
        return payload
    }
}
