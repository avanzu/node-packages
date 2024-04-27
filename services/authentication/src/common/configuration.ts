import type { LoggerOptions } from "pino";

export type ConfigOptions = {
    host: string
    port: number
    mongodb: { host: string; user: string; password: string; options: {} }
    logger: LoggerOptions
}

export type TypedConfig<T> = {
    get<K extends keyof T>(key: K): T[K]
}

export interface Config extends TypedConfig<ConfigOptions> {}
