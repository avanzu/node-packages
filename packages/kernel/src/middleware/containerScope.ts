import { type AwilixContainer, asFunction } from "awilix";
import type { Context, Middleware, Next } from "koa";

export function containerScope(container: AwilixContainer) : Middleware {
    return function createRequestScope(context: Context, next: Next) {
        const scope = container.createScope()
        context.scope = scope
        context.state.container = scope
        scope.register('authUser', asFunction(() => context.user, { lifetime: 'TRANSIENT' }))


        return next()

    }
}