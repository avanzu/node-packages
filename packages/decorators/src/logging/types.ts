export interface Logger {
    debug(message: string, metadata?: Record<string, any>): void
    info(message: string, metadata?: Record<string, any>): void
    warn(message: string, metadata?: Record<string, any>): void
    error(message: string, metadata?: Record<string, any>): void
}

export type LogOptions = {
    enter?: boolean
    exit?: boolean
    error?: boolean
    message?: string
    args?: boolean
    result?: boolean
    enterPrefix?: string
    errorPrefix?: string
    exitPrefix?: string
    level?: keyof Logger
}

export type LogContext = {
    time?: number
    ms?: number
    error?: unknown
    args?: unknown[]
    className: string
    methodName: string
    result?: unknown
}
