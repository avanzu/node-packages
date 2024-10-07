import type { AuthenticatorOptions, ResourceDefinition, ResourceMap, ConfigOptions, PluginDefinition } from '@avanzu/kernel'
import type { Options as MongoORM } from '@mikro-orm/mongodb'
import type { Options as AJVOptions } from 'ajv'
import type { RedisOptions } from 'ioredis'
import type { LoggerOptions } from 'pino'

// export type AuthenticationService = ResourceDefinition<'authentication'>

export type Resources = ResourceMap<any>

export type ConfigValues = ConfigOptions<Resources> & {
    host: string
    port: number
    publicRoot: string
    logger: LoggerOptions
    redis: RedisOptions
    validation: AJVOptions
    authentication: AuthenticatorOptions
    orm: MongoORM
    resources: Resources
    pluginBaseDir: string
    plugins: PluginDefinition[]
}
