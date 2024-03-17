import { IConfig } from "config";

export type ConfigOptions = {
    host: string
    port: number
    mongodb: { host: string, user: string, password: string, options: {} }
}

export type TypedConfig<T> = {
    get<K extends keyof T>(key: K) : T[K]
}

export interface Config extends TypedConfig<ConfigOptions> {}