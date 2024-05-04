import type { RedisOptions } from "ioredis"
import type { LoggerOptions } from "pino"

export type ConfigValues = {
    host: string
    port: number
    logger: LoggerOptions
    redis: RedisOptions
}



