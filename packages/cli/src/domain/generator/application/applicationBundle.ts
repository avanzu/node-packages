import { Bundle } from "../common/bundle";
import { GeneratorArguments } from "../common/context";
import { Template } from "../common/template";
import { DefaultConfigArguments } from "./templates/defaultConfig.tpl";
import { PackageJSON, PackageJSONArguments } from "./templates/package.json.tpl";

import AdmZip from 'adm-zip';
import path from 'node:path';

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