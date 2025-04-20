import { asClass } from 'awilix'
import type { Next } from 'koa'
import { getErrorView } from '..'
import type { AppContext, AppMiddleware, AppState, Container, Logger } from '../interfaces'

type Context = AppContext<Container, AppState<Container>>
type Middleware = AppMiddleware<Container, AppState<Container>, Context>

export function errorHandler(logger: Logger): Middleware {
    return async function errorHandlerMiddleware(context: Context, next: Next) {
        try {
            await next()
        } catch (error) {

            const ErrorView = getErrorView()
            const view = context.scope.build(asClass(ErrorView).inject(() => ({ error })))

            context.status = view.getStatus()
            context.body = view

            logger.error(`${view.status} ${view.reason}`, {...view.toJSON(), stack: view.stack })

        }
    }
}
