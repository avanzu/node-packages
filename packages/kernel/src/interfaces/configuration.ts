type RemoveKindField<Type> = {
    [Property in keyof Type as Exclude<Property, "kind">]: Type[Property]
};

export type ResourceDefinition<Kind extends string = any, Options extends {} = {}> = Options & {
    kind: Kind
}

export type ResourceMap<Resources extends ResourceDefinition = ResourceDefinition> = {
    [R in Resources as R['kind']] : RemoveKindField<R>
}

export type ConfigOptions<Resources extends ResourceMap = ResourceMap> = {
    host: string
    port: number
    namespace?: string
    resources: Resources
}
export type Configuration<T extends ConfigOptions = ConfigOptions> = {
    get<P extends keyof T>(key: P) : T[P]
}