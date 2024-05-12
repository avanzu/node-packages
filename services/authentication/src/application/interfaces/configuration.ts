import type { RedisOptions } from "ioredis"
import type { LoggerOptions } from "pino"
import type { Options as AJVOptions } from 'ajv'
import { type Options as MongoORM } from '@mikro-orm/mongodb'
import type { AuthenticatorOptions, ResourceDefinition, ResourceMap } from "@avanzu/kernel"

export type AuthenticationService = ResourceDefinition<'authentication'>
export type ConfigurationService = ResourceDefinition<'configuration'>
export type Resources = ResourceMap<any>


export type ConfigValues = {
    host: string
    port: number
    logger: LoggerOptions
    redis: RedisOptions
    validation: AJVOptions
    orm: MongoORM
    authentication: AuthenticatorOptions
    resources: Resources
}



