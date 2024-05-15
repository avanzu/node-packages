import type { AwilixContainer, InjectorFunction, NameAndRegistrationPair, Resolver } from "awilix";
import type { AuthUser } from "./app";
import type { Validator } from "./validation";
import type { Authenticator } from "./authenticator";

export interface AppServices {
    authUser: AuthUser
    validator: Validator
    authenticator: Authenticator
}

export interface Container<Services extends AppServices = AppServices> extends AwilixContainer<Services> {
    register<K extends keyof Services>(name: K, value: Resolver<Services[K]>) : this
    register(name: string | symbol, value: Resolver<unknown>): this
    register(registration: NameAndRegistrationPair<Services>) : this
}
