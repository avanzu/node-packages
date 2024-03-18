import { Context, Middleware, Next } from 'koa'
import { StatusCodes, getReasonPhrase } from 'http-status-codes'
import { TYPES } from './types'

export const errorHandler: Middleware = async (context: Context, next: Next) => {
    const started: number = Date.now()
    const logger = context.state.container.get(TYPES.Logger)
    try {
        await next()
    } catch (error: Error | unknown) {
        let statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR
        let stack: string
        if (error instanceof Error) {
            if ('status' in error) {
                statusCode = Number(error.status)
            }
            if('statusCode' in error) {
                statusCode = Number(error.statusCode)
            }
            stack = error.stack
        }

        const reason = getReasonPhrase(statusCode)

        // context.throw(statusCode, reason, { error })
        context.status = statusCode
        context.body = { statusCode, reason, details: `${error}` }

        logger.error(`${statusCode} ${reason}`, { error: `${error}`, stack })
    } finally {
        logger.info(`${context.method} ${context.path} ${context.status}`, {
            query: context.query,
            duration: `${Date.now() - started}ms`,
        })
    }
}
