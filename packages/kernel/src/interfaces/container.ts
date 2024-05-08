import { AwilixContainer, NameAndRegistrationPair, Resolver } from "awilix";

export interface Container<Services extends {} = {}> extends AwilixContainer<Services> {
    register<K extends keyof Services>(name: K, value: Resolver<Services[K]>) : this
    register(name: string | symbol, value: Resolver<unknown>): this
    register(registration: NameAndRegistrationPair<Services>) : this
}