import { Next } from "koa";
import { Context, Middleware } from "../interfaces";

export function authenticate() : Middleware {
    return function authenticateUser(context: Context, next: Next) {
        if(context.get('x-auth-key')) {
            context.user = { id: context.get('x-auth-key'), username: 'Authenticated' }
        }

        return next()
    }
}