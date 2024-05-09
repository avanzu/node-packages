type Discriminated = {
    kind: string
}
export type Constructor<T> = new (...args: unknown[]) => T

export type ClassMap<U extends Discriminated> = {
    [E in U as E['kind']]: new (...args: unknown[]) => E
}
export type InstanceMap<U extends Discriminated> = {
    [E in U as E['kind']]: E
}

export interface Entity extends Discriminated {}
export interface Feature<Input = any, Output = any> extends Discriminated {
    invoke(value: Input): Promise<Output>
}

export type InputType<U extends Feature<any, any>> = U extends Feature<infer Input> ? Input : never
export type OutputTyp<U extends Feature<any, any>> = U extends Feature<any, infer Output> ? Output : never
export type KindOf<U extends Discriminated> = U['kind']



