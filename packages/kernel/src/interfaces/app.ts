import Koa, { Context, DefaultState, Request as KoaRequest } from 'koa'
import { Container } from './container'
import { AppMiddleware } from './middleware'

export interface AuthUser {
    username?: string
    id?: string | number | symbol
    authenticated: boolean
    token?: string
    isAnonymous() : boolean
}

export interface AuthenticatedUser extends AuthUser {
    username: string
    id: string|number|symbol
    authenticated: true
}

export interface Request<Body = unknown> extends KoaRequest {
    body?: Body
}

export interface AppState<DIC extends Container> extends DefaultState {
    container: DIC
}

export interface AppContext<DIC extends Container, State extends AppState<DIC>, User extends AuthUser = AuthUser,  Body = unknown> extends Context {
    scope: DIC
    state: State
    user: User
    request: Request<Body>
}

export interface App<DIC extends Container, State extends AppState<DIC>, Context extends AppContext<DIC, State>>
    extends Koa<State, Context> {
        middleware: AppMiddleware<DIC, State, Context>[]
    }
