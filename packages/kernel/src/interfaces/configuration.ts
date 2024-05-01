export type ConfigOptions = {
    host: string
    port: number
}
export type Configuration<T extends ConfigOptions = ConfigOptions> = {
    get<P extends keyof T>(key: P) : T[P]
}