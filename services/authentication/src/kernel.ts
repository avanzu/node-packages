import Koa from 'koa'
import * as Routing from 'koa-router'
import koaQS from 'koa-qs'
import { Server } from 'http'
import { promisify } from 'util'
import {inject, injectable} from 'inversify'
import { Tenant } from './multitenancy/tenant'
import { TYPES } from './common/types'
import { Config, ConfigOptions } from './common/configuration'

export interface State extends Koa.DefaultState {
    tenant: Tenant
}
export interface Context extends Routing.RouterContext<State> {}
export interface KoaKernel extends Koa<State, Context> {}
export interface Middleware extends Routing.IMiddleware<State, Context>{}

@injectable()
export class Kernel extends Koa<State, Context> implements KoaKernel {
    server: Server
    constructor(@inject(TYPES.Config) protected options: Config) {
        super()
        koaQS(this)
        this.onServing = this.onServing.bind(this)
        this.shutdown = this.shutdown.bind(this)
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

        this.server = this.listen(host, port, this.onServing)
    }

    async shutdown() {
        console.log('Shutting down')
        if (true === Boolean(this.server)) {
            await promisify(this.server.close).call(this.server)
            this.server = null
        }

        console.log('shutdown complete')
    }
}
