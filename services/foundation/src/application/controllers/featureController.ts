import { All, Controller, Get, getUseCases } from "@avanzu/kernel";
import { Feature } from "~/domain";
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
            context.throw(StatusCodes.NOT_FOUND, `Feature ${featureId} not found`)
        }
        let feature: Feature = context.scope.build(featureInfo.useCase)

        let result = await feature.invoke(context.request.body)

        context.body = result
    }
}