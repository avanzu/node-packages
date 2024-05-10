import type { AwilixContainer, NameAndRegistrationPair, Resolver } from "awilix";
import type { AuthUser } from "./app";
import type { Validator } from "./validation";

export interface AppServices {
    authUser: AuthUser
    validator: Validator
}

export interface Container<Services extends AppServices = AppServices> extends AwilixContainer<Services> {
    register<K extends keyof Services>(name: K, value: Resolver<Services[K]>) : this
    register(name: string | symbol, value: Resolver<unknown>): this
    register(registration: NameAndRegistrationPair<Services>) : this
}