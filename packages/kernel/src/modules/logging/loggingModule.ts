import { AppServices, ConfigOptions, Configuration, Container, ContainerModule, EventHandlerSpec, Logger } from "~/interfaces";
import { PinoLogger } from "./pinoLogger";
import { asClass } from "awilix";
import { LoggerOptions } from "pino";

export type LoggingModuleExports = {
    appLogger: Logger
}

export type LoggingConfiguration =  {
    logger: LoggerOptions
}

export class LoggingContainerModule implements ContainerModule<LoggingModuleExports> {
    constructor(private config: Configuration<LoggingConfiguration>) {}

    getName(): string {
        return this.constructor.name
    }
    configure(container: Container<AppServices & LoggingModuleExports>): void {
        const resolver = asClass(PinoLogger).inject(() => ({ options: this.config.get('logger') }));
        container.register('appLogger', resolver)
    }
    getEventhandlers(): EventHandlerSpec[] {
        return []
    }

}