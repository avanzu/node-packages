import { Next } from 'koa'
import { AppContext, AppMiddleware, AppState, Container } from '../interfaces'

type Context = AppContext<Container, AppState<Container>>
type Middleware = AppMiddleware<Container, AppState<Container>, Context>

export function authenticate(): Middleware {
    return function authenticateToken(context: Context, next: Next) {
        let token: string = context.get('Authorization')
        if (false === Boolean(token)) {
            return next()
        }
        if (token.toLocaleLowerCase().startsWith('bearer')) {
            token = token.trim().split(' ').at(-1)
        }

        context.user = context.scope.cradle.authenticator.verifyToken(token)
        return next()
    }
}
