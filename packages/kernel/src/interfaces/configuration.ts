export type ConfigOptions = {
    host: string
    port: number
    namespace?: string
}
export type Configuration<T extends {}  = {}> = {
    get<P extends keyof (T & ConfigOptions)>(key: P & string) : (T & ConfigOptions)[P]
}