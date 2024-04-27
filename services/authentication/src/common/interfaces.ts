import type Koa from 'koa'
import type { RouterContext, IMiddleware } from 'koa-router'
import { type Tenant } from '~/multitenancy'

export interface DatabaseConnectorFactory<T> {
    create(tenantId: string): Promise<T>
}

export interface State extends Koa.DefaultState {
    tenant: Tenant
}

export interface Context extends RouterContext<State> {}
export interface KoaKernel extends Koa<State, Context> {}
export interface Middleware extends IMiddleware<State, Context> {}
