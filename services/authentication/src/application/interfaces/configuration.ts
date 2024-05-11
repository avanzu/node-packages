import type { RedisOptions } from "ioredis"
import type { LoggerOptions } from "pino"
import type { Options as AJVOptions } from 'ajv'
import { type Options as MongoORM } from '@mikro-orm/mongodb'
import type { AuthenticatorOptions } from "~/domain/services"
export type ConfigValues = {
    host: string
    port: number
    logger: LoggerOptions
    redis: RedisOptions
    validation: AJVOptions
    orm: MongoORM
    authenticator: AuthenticatorOptions
}



