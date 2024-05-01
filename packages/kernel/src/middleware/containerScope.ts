import { AwilixContainer } from "awilix";
import { Context, Middleware, Next } from "koa";

export function containerScope(container: AwilixContainer) : Middleware {
    return function createRequestScope(context: Context, next: Next) {
        let scope = container.createScope()
        context.scope = scope
        context.state.container = scope
        return next()

    }
}