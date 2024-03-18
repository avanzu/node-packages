import { Container } from 'inversify'
import { InversifyKoaServer } from 'inversify-koa-utils'
import Koa from 'koa'
import koaQS from 'koa-qs'
import * as Routing from 'koa-router'
import { promisify } from 'util'
import { Config, ConfigOptions } from './common/configuration'
import { TYPES } from './common/types'
import { Tenant } from './multitenancy/tenant'
import pino, { Logger } from 'pino'
import {Server} from 'http'
import { monitoringModule } from './monitoring/dependencyInjection/module'
import { multitenancyModule } from './multitenancy/dependencyInjection/module'
import { persistenceModule } from './persistence/dependencyInjection/module'
export interface State extends Koa.DefaultState {
    tenant: Tenant
}

export interface Context extends Routing.RouterContext<State> {}
export interface KoaKernel extends Koa<State, Context> {}
export interface Middleware extends Routing.IMiddleware<State, Context> {}

export class Kernel extends Koa<State, Context> implements KoaKernel {

    server: InversifyKoaServer
    container: Container
    httpServer: Server

    constructor(protected options: Config) {
        super()
        koaQS(this)
        this.onServing = this.onServing.bind(this)
        this.shutdown = this.shutdown.bind(this)
        this.container = this.createContainer()

    }

    protected createLogger() : Logger {
        const logger = pino()
        return logger
    }

    protected createContainer(): Container {
        const container = new Container()

        container.bind<Config>(TYPES.Config).toConstantValue(this.options)
        container.bind<Logger>(TYPES.Logger).toConstantValue(this.createLogger())

        container.load(monitoringModule, persistenceModule, multitenancyModule)

        return container
    }

    protected createServer() : InversifyKoaServer {
        const app = this as unknown as Koa
        const server = new InversifyKoaServer(this.container, null, null, app)

        return server
    }

    protected onServing() {
        console.log('server started')
    }

    async initialize() {
        process.on('SIGINT', this.shutdown)
        process.on('SIGTERM', this.shutdown)
    }

    getOption<T extends keyof ConfigOptions>(name: T, orElse?: ConfigOptions[T]): ConfigOptions[T] {
        return this.options.get<T>(name) ?? orElse
    }

    async serve() {
        const host = this.getOption('host')
        const port = this.getOption('port')

        this.server = this.createServer()
        this.httpServer = this.server.build().listen(port, host, this.onServing)
    }

    async shutdown() {
        console.log('Shutting down')
        if (true === Boolean(this.httpServer)) {
            await promisify(this.httpServer.close).call(this.httpServer)
            this.httpServer = null
        }
        if(true === Boolean(this.server)) {
            this.server = null
        }

        console.log('shutdown complete')
    }
}
