import { GeneratorContext, GeneratorArguments } from "../../common/context";
import { Template } from "../../common/template";

export class AppKernel implements Template {
    directory: string = './src/application';
    filename: string = 'appKernel.ts';
    async render(context: GeneratorContext<GeneratorArguments>): Promise<string> {
        return `
        import { ContainerBuilder, Kernel, Logger, PinoLogger } from '@avanzu/kernel'
        import { bodyParser } from '@koa/bodyparser'
        import koaHelmet from 'koa-helmet'
        import { AppContainerBuilder } from './dependencyInjection'
        import { Application, Config, Container, Middleware } from './interfaces'

        export class AppKernel extends Kernel<Config, Application, Container> {

            protected createLogger(): Logger {
                let loggerOptions = this.options.get('logger')
                return new PinoLogger(loggerOptions)
            }

            protected createContainerBuilder(): ContainerBuilder {
                return new AppContainerBuilder(this.options)
            }

            protected middlewares(): Middleware[] {
                return [ koaHelmet(), bodyParser() ]
            }
        }
        `
    }

}