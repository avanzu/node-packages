const throwable = (e: string | Error) => (e instanceof Error ? e : new Error(e))

export const panic = (e: string | Error): never => {
    throw throwable(e)
}

export const promiseOk = <T>(x: T): Promise<T> => Promise.resolve(x)
export const promiseErr = (e: string | Error): Promise<never> => Promise.reject(throwable(e))
