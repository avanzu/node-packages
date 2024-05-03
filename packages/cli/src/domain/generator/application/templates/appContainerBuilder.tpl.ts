import { GeneratorContext, GeneratorArguments } from "../../common/context";
import { Template } from "../../common/template";

export class AppContainerBuilder implements Template {
    directory: string = './src/application/dependencyInjection';
    filename: string = 'appContainerBuilder.ts';
    async render(context: GeneratorContext<GeneratorArguments>): Promise<string> {
        return `
        import { ContainerBuilder } from '@avanzu/kernel'
        import { asClass } from 'awilix'
        import { Config, Container } from '../interfaces'
        import { AppService } from '../services/appService'
        import  '../controllers'

        export class AppContainerBuilder implements ContainerBuilder {
            protected options: Config

            constructor(options: Config) {
                this.options = options
            }

            public async build(container: Container): Promise<void> {
                container.register('appService', asClass(AppService, { lifetime: 'SINGLETON' }))
            }
        }


        `
    }

}