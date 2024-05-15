import { ContainerBuilder, Kernel, Logger, PinoLogger, authenticate } from '@avanzu/kernel'
import { bodyParser } from '@koa/bodyparser'
import koaHelmet from 'koa-helmet'
import { AppContainerBuilder } from './dependencyInjection'
import { Application, Config, Container, Middleware } from './interfaces'
import { scopeORM } from './middleware/scopeORM'

export class AppKernel extends Kernel<Config, Application, Container> {

    protected createLogger(): Logger {
        let loggerOptions = this.options.get('logger')
        return new PinoLogger(loggerOptions)
    }

    protected createContainerBuilder(): ContainerBuilder {
        return new AppContainerBuilder(this.options, this.logger)
    }

    protected middlewares(): Middleware[] {
        return [ scopeORM(), koaHelmet(), bodyParser(), authenticate() ]
    }



}
