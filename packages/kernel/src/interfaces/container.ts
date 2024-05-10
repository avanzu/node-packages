import { AwilixContainer, NameAndRegistrationPair, Resolver } from "awilix";
import type { AuthUser } from "./app";

export interface AppServices {
    authUser: AuthUser
}

export interface Container<Services extends AppServices = AppServices> extends AwilixContainer<Services> {
    register<K extends keyof Services>(name: K, value: Resolver<Services[K]>) : this
    register(name: string | symbol, value: Resolver<unknown>): this
    register(registration: NameAndRegistrationPair<Services>) : this
}