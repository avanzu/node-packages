import { Context, Middleware, Next } from 'koa'
import { AuthUser } from '../interfaces'

const ANONYMOUS = { username: 'anonymous', id: Symbol('anonymous') }

export function authenticateAnonymous(identity: AuthUser = ANONYMOUS): Middleware {
    return function anonymous(context: Context, next: Next) {
        if (false === Boolean(context.user)) {
            context.user = identity
        }

        return next()
    }
}
