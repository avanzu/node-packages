import { asFunction } from 'awilix'
import { Next } from 'koa'
import { Context, Middleware } from '../interfaces'

export function scopeORM(): Middleware {
    return function forkEntityManager(context: Context, next: Next) {
        const ormProvider = context.scope.cradle.ORMProvider
        context.scope.register(
            'em',
            asFunction(() => ormProvider.entityManager().fork())
        )

        return next()
    }
}
