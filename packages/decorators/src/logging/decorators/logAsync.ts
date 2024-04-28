import { LogBox } from '../logBox'
import { LogOptions } from '../types'

export function LogAsync(options?: LogOptions): MethodDecorator {
    const logBox = new LogBox(options)
    return function (target: any, methodName: string | symbol, prop: PropertyDescriptor) {
        const decorator: PropertyDescriptor = {
            ...prop,
            value: async function (...args: any[]) {
                logBox.openContext(target, String(methodName), args)
                try {
                    logBox.logEnter()
                    let result = await prop.value.apply(this, args)
                    logBox.logExit(result)
                    return result
                } catch (error) {
                    logBox.logFailure(error)
                    throw error
                }
            },
        }

        return decorator
    }
}
