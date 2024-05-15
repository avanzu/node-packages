import * as Kernel from '@avanzu/kernel'
import { ConfigValues } from './configuration'
import { Services } from './services'

export type Config = Kernel.Configuration<ConfigValues>

export interface User extends Kernel.AuthUser {}

export interface Container extends Kernel.Container<Services> {}

export interface State extends Kernel.AppState<Container> {}

export interface Context<Query extends {} = {}, Body = unknown>
    extends Kernel.AppContext<Container, State, User, Body> {
    query: Query
}

export interface Middleware extends Kernel.AppMiddleware<Container, State, Context> {}

export interface Application extends Kernel.App<Container, State, Context> {}
