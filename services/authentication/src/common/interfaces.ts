import Koa from 'koa'
import * as Routing from 'koa-router'
import { Tenant } from '~/multitenancy'

export interface DatabaseConnectorFactory<T> {
    create(tenantId: string) : Promise<T>
}

export interface State extends Koa.DefaultState {
    tenant: Tenant
}

export interface Context extends Routing.RouterContext<State> {}
export interface KoaKernel extends Koa<State, Context> {}
export interface Middleware extends Routing.IMiddleware<State, Context> {}
