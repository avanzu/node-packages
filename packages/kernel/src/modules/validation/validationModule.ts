import { asClass } from "awilix";
import { AppServices, ConfigOptions, Configuration, Container, ContainerModule, EventHandlerSpec, Validator } from "~/interfaces";
import { AJVValidator } from "./ajvValidator";
import Ajv, { Options } from "ajv";

export type ValidationModuleExports = {
    validator: Validator
}

export type ValidatorConfiguration =  {
    validator: Options
}

export class ValidationContainerModule implements ContainerModule<ValidationModuleExports> {
    constructor(private config :Configuration<ValidatorConfiguration>) {}

    getName(): string {
        return this.constructor.name
    }

    configure(container: Container<AppServices & ValidationModuleExports>): void {
        const resolver = asClass(Ajv).singleton().inject(() => ({ opts: this.config.get('validator') }));
        container.register('ajv', resolver)
        container.register('validator', asClass(AJVValidator))
    }

    getEventhandlers(): EventHandlerSpec[] {
        return []
    }
}