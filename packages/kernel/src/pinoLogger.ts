import pino, { LoggerOptions, type Logger as Pino } from 'pino'
import { Logger } from './interfaces/logger'
import { LogBox } from '@avanzu/decorators'

export class PinoLogger implements Logger {
    protected pino: Pino

    constructor(options: LoggerOptions) {
        this.pino = pino({ ...options })
        LogBox.use(this)
    }

    debug(message: string, metadata?: Record<string, any> | undefined): void {
        this.pino.debug({ ...metadata }, message)
    }
    info(message: string, metadata?: Record<string, any> | undefined): void {
        this.pino.info({ ...metadata }, message)
    }
    warn(message: string, metadata?: Record<string, any> | undefined): void {
        this.pino.warn({ ...metadata }, message)
    }
    error(message: string, metadata?: Record<string, any> | undefined): void {
        this.pino.error({ ...metadata }, message)
    }
}
