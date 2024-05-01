import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { Context, Middleware, Next } from 'koa'
import { Logger } from '../interfaces/logger'

export function errorHandler(logger: Logger): Middleware {
    return async function errorHandlerMiddleware(context: Context, next: Next) {
        try {
            await next()
        } catch (error) {
            let statusCode = StatusCodes.INTERNAL_SERVER_ERROR
            let reason = ReasonPhrases.INTERNAL_SERVER_ERROR
            let stack: string

            if(error instanceof Object) {
                if('status' in error) {
                    statusCode = Number(error.status)
                }
                if('statusCode' in error) {
                    statusCode = Number(error.statusCode)
                }
            }

            if(error instanceof Error) {
                stack = String(error.stack)
            }

            context.status = statusCode
            context.body = { statusCode, reason, error }
            logger.error(`${statusCode} ${reason}`, { error: `${error}`, stack })
        }
    }
}
