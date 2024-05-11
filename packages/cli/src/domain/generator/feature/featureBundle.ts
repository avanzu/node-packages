import { Bundle } from "../common/bundle";
import { GeneratorArguments } from "../common/context";
import { Template } from "../common/template";
import { FeatureTemplate } from "./templates/barrel.tpl";
import { BarrelTemplate } from "./templates/feature.tpl";
import { FeatureArgs, InputTemplate } from "./templates/input.tpl";
import { OutputTemplate } from "./templates/output.tpl";

export type FeatureBundleArgs = GeneratorArguments & FeatureArgs

export class FeatureBundle extends Bundle<FeatureBundleArgs>{


    protected getTemplates(): Template[] {

        return [
            new InputTemplate(this.args),
            new OutputTemplate(this.args),
            new FeatureTemplate(this.args),
            new BarrelTemplate(this.args)
        ]

    }

}