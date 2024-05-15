import { DemoFeature, PayloadResolver, DemoInput } from "~/domain";
import { Context } from "../interfaces";
import { InputResolver } from "@avanzu/kernel";

@InputResolver(DemoFeature)
export class DemoFeatureResolver implements PayloadResolver<DemoFeature, Context> {
    async resolve(source: Context): Promise<DemoInput> {
        return (source.request.body || {}) as DemoInput

    }

}