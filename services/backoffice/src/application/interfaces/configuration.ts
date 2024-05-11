import type { RedisOptions } from "ioredis"
import type { LoggerOptions } from "pino"
import type { Options as AJVOptions } from 'ajv'
import type { AuthenticatorOptions } from "@avanzu/kernel"
import { type Options as MongoORM } from '@mikro-orm/mongodb'

export type ConfigValues = {
    host: string
    port: number
    logger: LoggerOptions
    redis: RedisOptions
    validation: AJVOptions
    authentication: AuthenticatorOptions
    orm: MongoORM
}



