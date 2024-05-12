import type { RedisOptions } from "ioredis"
import type { LoggerOptions } from "pino"
import type { Options as AJVOptions } from 'ajv'
import type { AuthenticatorOptions, ResourceDefinition, ResourceMap } from "@avanzu/kernel"
import type { Options as MongoORM } from '@mikro-orm/mongodb'

export type AuthenticationService = ResourceDefinition<'authentication', { url: string, auth: true }>
export type ConfigurationService = ResourceDefinition<'configuration', { prefix: string, duration: 5 }>
export type Resources = ResourceMap<AuthenticationService | ConfigurationService>

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



