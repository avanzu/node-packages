import { Server } from 'http'
import { Container } from 'inversify'
import { InversifyKoaServer } from 'inversify-koa-utils'
import Koa from 'koa'
import koaQS from 'koa-qs'
import pino, { Logger } from 'pino'
import { promisify } from 'util'
import { Config, ConfigOptions, KoaKernel, State, Context, TYPES } from './common'
import { rootModule } from './dependencyInjection'
import { errorHandler } from './common/errorHandler'
import { monitoringModule } from './monitoring'
import { multitenancyModule } from './multitenancy'
import { persistenceModule } from './persistence'

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

    protected createContainer(): Container {
        const container = new Container()

        container.load(
            rootModule(this, this.options),
            monitoringModule,
            persistenceModule,
            multitenancyModule
        )

        return container
    }

    protected createServer(): InversifyKoaServer {
        const app = this as unknown as Koa
        const server = new InversifyKoaServer(this.container, null, null, app)

        return server
    }

    protected onServing() {
        this.getLogger().info({ address: this.getAddress() }, 'Server started')
    }

    async initialize() {
        this.use(errorHandler)
        process.on('SIGINT', this.shutdown)
        process.on('SIGTERM', this.shutdown)
    }

    getOption<T extends keyof ConfigOptions>(name: T, orElse?: ConfigOptions[T]): ConfigOptions[T] {
        return this.options.get<T>(name) ?? orElse
    }

    getAddress() {
        return `http://${this.getOption('host')}:${this.getOption('port')}`
    }

    getLogger() {
        return this.container.get<Logger>(TYPES.Logger)
    }

    async serve() {
        const host = this.getOption('host')
        const port = this.getOption('port')

        this.server = this.createServer()
        this.httpServer = this.server.build().listen(port, host, this.onServing)
    }

    async shutdown() {
        this.getLogger().info('Shutting down')
        if (true === Boolean(this.httpServer)) {
            await promisify(this.httpServer.close).call(this.httpServer)
            this.httpServer = null
        }
        if (true === Boolean(this.server)) {
            this.server = null
        }

        this.getLogger().info('shutdown complete')
    }
}
