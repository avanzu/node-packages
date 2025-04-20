import type { AppServices, Authenticator, ConfigOptions, Configuration, Container, ContainerModule, EventHandlerSpec } from "~/interfaces";
import { type AuthenticatorOptions, JWTAuthenticator } from "./jwtAuthenticator";
import { asClass } from "awilix";

export type AuthenticationModuleExports = {
    authenticator: Authenticator
}

export type AuthenticationConfiguration =  {
    authenticator: AuthenticatorOptions
}

export class AuthenticationContainerModule implements ContainerModule<AuthenticationModuleExports> {

    constructor(private options: Configuration<AuthenticationConfiguration>){}

    getName(): string {
        return this.constructor.name
    }
    getEventhandlers(): EventHandlerSpec[] {
        return []
    }
    configure(container: Container<AppServices & AuthenticationModuleExports>): void {
        const resolver = asClass(JWTAuthenticator).inject(() => ({
            options: this.options.get('authenticator')
        }));
        container.register('authenticator', resolver)
    }
}