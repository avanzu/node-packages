import { LoggerOptions } from "pino"
import { Configuration } from '@avanzu/kernel'

export type ConfigValues = {
    host: string
    port: number
    logger: LoggerOptions
}


export type Config = Configuration<ConfigValues>

