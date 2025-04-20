import type { Middleware as KoaMiddleware } from 'koa'
import type { AppState, AppContext } from './app'
import type { Container } from './container'

export interface AppMiddleware<
    DIC extends Container,
    State extends AppState<DIC>,
    Context extends AppContext<DIC, State>
> extends KoaMiddleware<State, Context> {}
