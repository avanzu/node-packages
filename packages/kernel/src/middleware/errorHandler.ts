import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import {  Next } from 'koa'
import { Logger, AppContext, Container, AppState, AppMiddleware } from '../interfaces'
import { getErrorView } from '..'
import { asClass } from 'awilix'

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
