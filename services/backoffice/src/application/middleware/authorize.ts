import { Next } from "koa";
import { Context, Middleware } from "../interfaces";
import { AuthorizationResult, Permission } from "@avanzu/kernel";

export function authorize(permission: Permission) : Middleware {
    return async function authorizeUser(context: Context, next: Next) {
        let authService = context.scope.cradle.authorization
        let currentUser = context.scope.cradle.authUser
        let result = await authService.isGranted(currentUser, permission)
        if(AuthorizationResult.GRANTED !== result) {
            throw new Error('NotGranted')
        }

        return next()

    }
}