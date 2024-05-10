import { Bundle } from "../common/bundle";
import { GeneratorArguments } from "../common/context";
import { Template } from "../common/template";
import { AppContainerBuilder } from "./templates/dependencyInjection/appContainerBuilder.tpl";
import { AppController } from "./templates/controllers/appController.tpl";
import { AppKernel } from "./templates/appKernel.tpl";
import { AppService } from "./templates/services/appService.tpl";
import { AppTest } from "./templates/appTest.tpl";
import { ControllerBarrel } from "./templates/controllers/controllerBarrel.tpl";
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
import { NodemonJSON } from "./templates/nodemon.json.tpl";
import { DIBarrel } from "./templates/dependencyInjection/barrel.tpl";
import { Dockerfile } from "./templates/docker.tpl";
import { CurrentUser } from "./templates/domain/interfaces/currentUser.tpl";
import { DomainInterfaces } from "./templates/domain/interfaces/foundation.tpl";
import { DomainInterfacesBarrel } from "./templates/domain/interfaces/barrel.tpl";
import { FeatureController } from "./templates/controllers/featureController.tpl";
import { DemoFeature } from "./templates/domain/features/demo.tpl";
import { FeaturesBarrel } from "./templates/domain/features/barrel.tpl";

import decompress from 'decompress'
import path from 'node:path'
import AdmZip from 'adm-zip'

export type ApplicationBundleArgs = GeneratorArguments & PackageJSONArguments & DefaultConfigArguments

export class ApplicationBundle extends Bundle<ApplicationBundleArgs> {

    async generate(): Promise<void> {


        super.generate()
        let archive = new AdmZip(this.getArchivePath())
        await archive.extractAllTo(this.args.cwd)
        // await decompress(this.getArchivePath(), this.args.cwd)
    }

    protected getArchivePath() {
        return path.normalize(path.join(__dirname, '../../../../fixtures', 'application.template.zip'))
    }

    protected getTemplates(): Template[] {
        return [
            new PackageJSON(),
            // new NodemonJSON(),
            // new JestConfig(),
            // new TSConfig(),
            // new TSConfigBuild(),
            // new Main(),
            // new AppKernel(),
            // new AppService(),
            // new AppController(),
            // new AppContainerBuilder(),
            // new DIBarrel(),
            // new InterfacesBarrel(),
            // new ApplicationInterface(),
            // new ConfigurationInterface(),
            // new ServicesInterface(),
            // new DefaultConfig(),
            // new AppTest(),
            // new ControllerBarrel(),
            // new Dockerfile(),
            // new CurrentUser(),
            // new DomainInterfaces(),
            // new DomainInterfacesBarrel(),
            // new FeatureController(),
            // new DemoFeature(),
            // new FeaturesBarrel()
        ]
    }

}