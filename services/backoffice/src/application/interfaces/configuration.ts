import type { RedisOptions } from "ioredis"
import type { LoggerOptions } from "pino"
import type { Options as AJVOptions } from 'ajv'
import type { AuthenticatorOptions, ResourceDefinition, ResourceMap } from "@avanzu/kernel"
import { type Options as MongoORM } from '@mikro-orm/mongodb'
import  type { AxiosRequestConfig } from 'axios'



export type AuthorizationService = ResourceDefinition<'authorization', AxiosRequestConfig>
export type Resources = ResourceMap<AuthorizationService>

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



