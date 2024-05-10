import { DemoFeature, PayloadResolver } from "~/domain";
import { Context } from "../interfaces";
import { UseCaseInputResolver } from "@avanzu/kernel";

@UseCaseInputResolver(DemoFeature)
export class DemoFeatureResolver implements PayloadResolver<DemoFeature, Context> {
    async resolve(source: Context<{}, unknown>): Promise<{ name?: string | undefined; }> {
        return source.request.body || {}

    }

}