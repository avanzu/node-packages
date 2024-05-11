import 'reflect-metadata'
import { Plugins } from '../plugins'
import { ExecutionContext } from '../types'
import { PLUGIN_KEY } from '../types'

export function Pluggable(): MethodDecorator {
    return function (target: any, methodName: string | symbol, prop: PropertyDescriptor) {
        const decorator: PropertyDescriptor = {
            ...prop,
            value: async function (...params: any[]) {
                const key = Reflect.getMetadata(PLUGIN_KEY, target.constructor)
                let callables = Plugins.getCallables(key, String(methodName))
                let context: ExecutionContext = { params }

                for (let next of callables.before) context = (await next(context)) || context

                if (undefined === context.result)
                    context.result = await prop.value.apply(this, context.params)

                for (let next of callables.after) context = (await next(context)) || context

                return context.result
            },
        }

        return decorator
    }
}
