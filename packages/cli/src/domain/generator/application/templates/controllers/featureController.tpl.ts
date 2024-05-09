import { GeneratorContext, GeneratorArguments } from "~/domain/generator/common/context";
import { Template } from "~/domain/generator/common/template";

export class FeatureController implements Template {
    directory: string = './src/application/controllers';
    filename: string = 'featureController.ts';
    async render(context: GeneratorContext<GeneratorArguments>): Promise<string> {
        return `
        import { All, Controller, Get, getUseCases } from "@avanzu/kernel";
        import { Feature } from "~/domain/interfaces";
        import { Context } from "../interfaces";
        import { StatusCodes } from "http-status-codes";

        @Controller('/features')
        export class FeatureController {


            @Get('/')
            async list(context: Context) : Promise<void> {
                context.body = getUseCases().map((info) => info.containerId)
            }

            @All('/:featureId')
            async dispatch(context: Context) : Promise<any> {
                let featureId = context.params.featureId
                let featureInfo = getUseCases().find((info) => info.containerId === featureId)
                if( null == featureInfo) {
                    context.throw(StatusCodes.NOT_FOUND, \`Feature \${featureId} not found\`)
                }
                let feature: Feature = context.scope.build(featureInfo.useCase)

                let result = await feature.invoke(context.request.body)

                context.body = result
            }
        }
        `
    }

}