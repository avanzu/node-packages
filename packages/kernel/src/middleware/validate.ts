import { Next } from 'koa'
import { AppContext, AppMiddleware, AppState, Container, Schema } from '../interfaces'
import { ValidationError } from '~/errors'

type Context = AppContext<Container, AppState<Container>>
type Middleware = AppMiddleware<Container, AppState<Container>, Context>

export function validate(schema: Schema, location: 'query' | 'body' = 'body')  : Middleware  {
    return async function validatorMiddleware(context: Context, next: Next) {
        let validator = context.scope.cradle.validator
        let payload = location === 'query' ? context.query : context.request.body
        let result = await validator.validate(schema, payload)
        if(false === result.isValid) {
            throw new ValidationError(result.errors)
        }
        return next()
    }
}