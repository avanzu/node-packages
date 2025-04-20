import { ContainerBuilder, Kernel, Logger, PinoLogger, authenticate, PluggableKernel } from '@avanzu/kernel'
import { bodyParser } from '@koa/bodyparser'
import koaHelmet from 'koa-helmet'
import { AppContainerBuilder } from './dependencyInjection'
import { Application, Config, Container, Middleware } from './interfaces'
import { scopeORM } from './middleware/scopeORM'
import koaStatic from 'koa-static'

export class AppKernel extends Kernel<Config, Application, Container> {
    protected createLogger(): Logger {
        const loggerOptions = this.options.get('logger')
        return new PinoLogger(loggerOptions)
    }

    protected createContainerBuilder(): ContainerBuilder<Container> {
        return new AppContainerBuilder(this.options, this.logger)
    }

    protected middlewares(): Middleware[] {
        return [scopeORM(), koaStatic(this.options.get('publicRoot')), koaHelmet({ contentSecurityPolicy: undefined }), bodyParser(), authenticate()]
    }
}
