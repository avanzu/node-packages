export interface Logger {
    debug(message: string, metadata?: Record<string, any>): void
    info(message: string, metadata?: Record<string, any>): void
    warn(message: string, metadata?: Record<string, any>): void
    error(message: string, metadata?: Record<string, any>): void
}
