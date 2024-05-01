import { Middleware as KoaMiddleware } from 'koa'
import { AppState, AppContext } from './app'
import { Container } from './container'

export interface AppMiddleware<
    DIC extends Container,
    State extends AppState<DIC>,
    Context extends AppContext<DIC, State>
> extends KoaMiddleware<State, Context> {}
