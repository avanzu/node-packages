import { DemoFeature, PayloadResolver, DemoPayload } from "~/domain";
import { Context } from "../interfaces";
import { InputResolver } from "@avanzu/kernel";

@InputResolver(DemoFeature)
export class DemoFeatureResolver implements PayloadResolver<DemoFeature, Context> {
    async resolve(source: Context<{}, { name?: string }>): Promise<DemoPayload> {
        return (source.request.body || {}) as DemoPayload

    }

}