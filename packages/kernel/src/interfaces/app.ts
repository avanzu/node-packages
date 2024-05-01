import Koa, { Context, DefaultState } from 'koa'
import { Container } from './container'
import { AppMiddleware } from './middleware'

export interface AppState<DIC extends Container> extends DefaultState {
    container: DIC
}

export interface AppContext<DIC extends Container, State extends AppState<DIC>> extends Context {
    scope: DIC
    state: State
}

export interface App<DIC extends Container, State extends AppState<DIC>, Context extends AppContext<DIC, State>>
    extends Koa<State, Context> {
        middleware: AppMiddleware<DIC, State, Context>[]
    }
