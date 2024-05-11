import { Next } from "koa";
import { Context, Middleware } from "../interfaces";
import { RequestContext } from "@mikro-orm/core";
import { asFunction, asValue } from "awilix";

export function scopeORM() : Middleware {
    return  function forkEntityManager(context: Context, next: Next) {
        let ormProvider = context.scope.cradle.ORMProvider
        context.scope.register('em', asFunction(() => ormProvider.entityManager().fork()))

        return next()


    }
}