import type { AuthenticatorOptions, ConfigOptions, PluginDefinition } from '@avanzu/kernel'
import type { Options as MongoORM } from '@mikro-orm/mongodb'
import type { Options as AJVOptions } from 'ajv'
import type { RedisOptions } from 'ioredis'
import type { LoggerOptions } from 'pino'

// export type AuthenticationService = ResourceDefinition<'authentication'>



export type ConfigValues = ConfigOptions & {
    host: string
    port: number
    publicRoot: string
    logger: LoggerOptions
    redis: RedisOptions
    validation: AJVOptions
    authentication: AuthenticatorOptions
    orm: MongoORM

    pluginBaseDir: string
    plugins: PluginDefinition[]
}
