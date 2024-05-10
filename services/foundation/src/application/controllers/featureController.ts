import { All, Controller, Get, UseCaseInfo, getResolver, getUseCase, getUseCases } from '@avanzu/kernel'
import { StatusCodes } from 'http-status-codes'
import { Feature, PayloadResolver } from '~/domain'
import { Context } from '../interfaces'

@Controller('/features')
export class FeatureController {
    @Get('/')
    async list(context: Context): Promise<void> {
        context.body = getUseCases().map((info) => info.id)
    }

    @All('/:featureId')
    async dispatch(context: Context): Promise<any> {
        let featureId = context.params.featureId
        let featureInfo = getUseCase(featureId)
        if (null == featureInfo) {
            context.throw(StatusCodes.NOT_FOUND, `Feature ${featureId} not found`)
        }
        let feature: Feature = context.scope.build(featureInfo.useCase)
        let payload = await this.resolvePayload(featureInfo, context)

        let result = await feature.invoke(payload)

        context.body = result
    }

    private async resolvePayload(useCaseInfo: UseCaseInfo, context: Context) {
        let payload = context.request.body
        let resolverClass = getResolver(useCaseInfo.useCase)
        if (null === resolverClass) return payload
        let resolver: PayloadResolver = context.scope.build(resolverClass)
        payload = await resolver.resolve(context)
        return payload
    }
}
