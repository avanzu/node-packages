import { PluginHookContext } from './HookContext'

export type PluginDefinition<Config extends {} = {}> =
    | LocalPluginDefinition<Config>
    | PackagePluginDefinition<Config>
    | RemotePluginDefinition<Config>

// Local Plugin Definition
export type LocalPluginDefinition<Config extends {} = {}> = {
    modulePath: string
    className: string
    config: Config
    type: 'local'
}

// Package Plugin Definition
export type PackagePluginDefinition<Config extends {} = {}> = {
    packageName: string
    className: string
    config: Config
    type: 'package'
}

// Remote Plugin Definition
export type RemotePluginDefinition<Config extends {} = {}> = {
    baseURL: string
    hooks: Record<string, string>
    name: string
    version: string
    config: Config
    type: 'remote'
    dependsOn: string[]
    publicKey: string
}

export interface Plugin {
    name(): string
    version(): string
    dependsOn(): string[]
    description(): string

    invoke(context: PluginHookContext): Promise<PluginHookContext>
}


export interface Initializable {
    initialize() : Promise<void>
}

export function isInitializable(value: unknown) : value is Initializable {
    if(false === (typeof value === 'object')) return false
    if(false === ('initialize' in value)) return false
    if(false === (typeof value.initialize === 'function')) return false
    return true
}

export interface Disposable {
    dispose() : Promise<void>
}
export function isDisposable(value: unknown) : value is Disposable {
    if(false === (typeof value === 'object')) return false
    if(false === ('dispose' in value)) return false
    if(false === (typeof value.dispose === 'function')) return false
    return true
}