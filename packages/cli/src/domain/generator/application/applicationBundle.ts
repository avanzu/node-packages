import { Bundle } from "../common/bundle";
import { GeneratorArguments } from "../common/context";
import { Template } from "../common/template";
import { AppContainerBuilder } from "./templates/appContainerBuilder.tpl";
import { AppController } from "./templates/appController.tpl";
import { AppKernel } from "./templates/appKernel.tpl";
import { AppService } from "./templates/appService.tpl";
import { AppTest } from "./templates/appTest.tpl";
import { DefaultConfig, DefaultConfigArguments } from "./templates/defaultConfig.tpl";
import { ApplicationInterface } from "./templates/interfaces/application.tpl";
import { InterfacesBarrel } from "./templates/interfaces/barrel.tpl";
import { ConfigurationInterface } from "./templates/interfaces/configuration.tpl";
import { ServicesInterface } from "./templates/interfaces/services.tpl";
import { JestConfig } from "./templates/jest.config.json.tpl";
import { Main } from "./templates/main.tpl";
import { PackageJSON, PackageJSONArguments } from "./templates/package.json.tpl";
import { TSConfigBuild } from "./templates/tsconfig.build.json.tpl";
import { TSConfig } from "./templates/tsconfig.json.tpl";

export type ApplicationBundleArgs = GeneratorArguments & PackageJSONArguments & DefaultConfigArguments

export class ApplicationBundle extends Bundle<ApplicationBundleArgs> {

    protected getTemplates(): Template[] {
        return [
            new PackageJSON(),
            new JestConfig(),
            new TSConfig(),
            new TSConfigBuild(),
            new Main(),
            new AppKernel(),
            new AppService(),
            new AppController(),
            new AppContainerBuilder(),
            new InterfacesBarrel(),
            new ApplicationInterface(),
            new ConfigurationInterface(),
            new ServicesInterface(),
            new DefaultConfig(),
            new AppTest()

        ]
    }

}