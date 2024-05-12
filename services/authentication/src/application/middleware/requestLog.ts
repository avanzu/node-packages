import { Next } from "koa";
import { Context, Middleware } from "../interfaces";
import { Logger } from "@avanzu/kernel";

export function requestLog(logger: Logger) : Middleware {
    return function logTraffic(context: Context, next: Next) {
        logger.info(`[${context.method}] [${context.path}]`)
        return next()
    }
}