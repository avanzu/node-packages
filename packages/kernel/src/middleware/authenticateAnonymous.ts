import type { Context, Middleware, Next } from 'koa'
import { Anonymous } from '~/modules'


export function authenticateAnonymous(): Middleware {
    return function anonymous(context: Context, next: Next) {
        if (false === Boolean(context.user)) {
            context.user = new Anonymous()
        }

        return next()
    }
}
