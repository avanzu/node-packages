import { Bundle } from "../common/bundle";
import { GeneratorArguments } from "../common/context";
import { Template } from "../common/template";
import { JestConfig } from "./templates/jest.config.json.tpl";
import { PackageJSON, PackageJSONArguments } from "./templates/package.json.tpl";
import { TSConfigBuild } from "./templates/tsconfig.build.json.tpl";
import { TSConfig } from "./templates/tsconfig.json.tpl";

export type ApplicationBundleArgs = GeneratorArguments & PackageJSONArguments

export class ApplicationBundle extends Bundle<ApplicationBundleArgs> {

    protected getTemplates(): Template[] {
        return [
            new PackageJSON(),
            new JestConfig(),
            new TSConfig(),
            new TSConfigBuild()
        ]
    }

}