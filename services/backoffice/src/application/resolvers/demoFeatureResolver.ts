import { Demo, PayloadResolver, DemoInput } from "~/domain";
import { Context } from "../interfaces";
import { InputResolver } from "@avanzu/kernel";

@InputResolver(Demo)
export class DemoFeatureResolver implements PayloadResolver<Demo, Context> {
    async resolve(source: Context): Promise<DemoInput> {
        return (source.request.body || {}) as DemoInput

    }

}