import { createContainer } from 'awilix'
import { loadControllers } from 'awilix-koa'
import Koa, { Middleware } from 'koa'
import KoaQS from 'koa-qs'
import { Server, AddressInfo } from 'net'
import * as Types from './interfaces'
import { containerScope, errorHandler } from './middleware'
import { promisify } from 'node:util'
import { asyncDispose, asyncInit } from 'awilix-manager'
import { mountControllers } from './decorators/routing'
import { authenticateAnonymous } from './middleware/authenticateAnonymous'

export abstract class Kernel<
    Config extends Types.Configuration,
    App extends Types.App<any, any, any>,
    Container extends Types.Container
> {
    protected app: App
    protected container: Container
    protected logger: Types.Logger
    protected options: Config
    protected _server?: Server
    protected _address?: AddressInfo

    constructor(options: Config) {
        this.options = options
        this.logger = this.createLogger()
        this.container = this.createContainer()
        this.app = KoaQS(this.createApp())
    }

    get server() {
        return this._server
    }

    get address() {
        return this._address
    }

    public async boot(): Promise<void> {
        await this.buildContainer()
        await asyncInit(this.container)
        this.addMiddlewares()
        this.loadControllers()
    }

    public async serve(): Promise<Server> {
        let host = this.options.get('host')
        let port = this.options.get('port')
        let serving = new Promise<Server>((Ok) => {
            this._server = this.app.listen(port, host, () => {
                this._address = this._server.address() as AddressInfo
                this.logger.info('Server running', { host, port, url: `http://${host}:${port}` })
                Ok(this._server)
            })
        })
        return await serving
    }

    public async shutdown(): Promise<void> {
        await asyncDispose(this.container)

        if (true === Boolean(this._server)) {
            await promisify(this._server.close).call(this._server)
        }
    }

    protected createContainer(): Container {
        return createContainer({ injectionMode: 'CLASSIC', strict: true }) as Container
    }

    protected async buildContainer() {
        let builder = this.createContainerBuilder()
        await builder.build(this.container)
    }

    protected addMiddlewares() {
        this.app.use(errorHandler(this.logger))
        this.app.use(authenticateAnonymous())
        this.app.use(containerScope(this.container))
        for (let middleware of this.middlewares()) {
            this.app.use(middleware)
        }
    }

    protected createApp(): App {
        return new Koa() as App
    }

    protected abstract createContainerBuilder(): Types.ContainerBuilder
    protected getControllerPaths(): string {
        return '**/controllers/*.js'
    }
    protected middlewares(): Types.AppMiddleware<any, any, any>[] {
        return []
    }

    protected abstract createLogger(): Types.Logger

    protected loadControllers() {
        let router = mountControllers()
        this.app.use(router.routes())
        // let controllers = loadControllers(this.getControllerPaths())
        // this.app.use(controllers)
    }
}
