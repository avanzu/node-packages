import type { AuthenticatorOptions, ResourceDefinition, ResourceMap } from "@avanzu/kernel"
import type { Options as MongoORM } from '@mikro-orm/mongodb'
import type { Options as AJVOptions } from 'ajv'
import type { RedisOptions } from "ioredis"
import type { LoggerOptions } from "pino"

// export type AuthenticationService = ResourceDefinition<'authentication'>

export type Resources = ResourceMap<any>

export type ConfigValues = {
    host: string
    port: number
    logger: LoggerOptions
    redis: RedisOptions
    validation: AJVOptions
    authentication: AuthenticatorOptions
    orm: MongoORM
    resources: Resources
}



