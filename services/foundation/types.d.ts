import type { ConfigOptions } from '@avanzu/kernel'
declare module 'config' {
    interface IConfig {
        get<P extends keyof ConfigOptions>(key: P & string) : ConfigOptions[P]
    }
}