/**
 * Dedicated controller per usecase approach.
 *
 * UseCases handled by this controller are constructor injected.
 * Each endpoint should handle exactly one UseCase.
 * Each endpoint is responsible to transform the request payload into the UseCase input.
 */
import * as Kernel from '@avanzu/kernel'
import { DemoFeature, DemoInputSchema } from '~/domain'
import { Context } from '../interfaces'

@Kernel.Controller('')
export class DemoController {
    constructor(protected demo: DemoFeature) {}

    @Kernel.Post('/demo', Kernel.validate(DemoInputSchema))
    async invoke(context: Context) {
        context.body = await this.demo.invoke(context.body || {})
    }
}
