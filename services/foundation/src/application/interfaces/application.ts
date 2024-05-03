import * as Avanzu from '@avanzu/kernel'
import { Services } from './services';
import { ConfigValues } from './configuration'

export type Config = Avanzu.Configuration<ConfigValues>

export interface User extends Avanzu.AuthUser {}

export interface Container extends Avanzu.Container<Services> {}

export interface State extends Avanzu.AppState<Container> {}

export interface Context<Query extends {} = {}, Body = unknown> extends Avanzu.AppContext<Container, State, User, Body> {
    query: Query
}

export interface Middleware extends Avanzu.AppMiddleware<Container, State, Context> {}

export interface Application extends Avanzu.App<Container, State, Context> {}
