import 'reflect-metadata'

export interface IPlugin {}
export type Id = string | symbol | Function

export const PLUGIN_KEY = Symbol('plugin.key')

export type AsyncCallable<Args extends any[] = any[], Result = any> = (
    context: ExecutionContext<Args, Result>
) => Promise<void> | Promise<ExecutionContext<Args, Result>>

export type Callable<Args extends any[] = any[], Result = any> = (
    context: ExecutionContext<Args, Result>
) => void | ExecutionContext<Args, Result>

export type Callables<Args extends any[] = any[], Result = any> = {
    before: (Callable<Args, Result> | AsyncCallable<Args, Result>)[]
    after: (Callable<Args, Result> | AsyncCallable<Args, Result>)[]
}

export type ExecutionContext<Args extends any[] = any[], Result = any> = {
    params: Args
    result?: Result
}
