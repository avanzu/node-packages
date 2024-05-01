import { ContainerBuilder } from "@avanzu/kernel";
import { asClass } from "awilix";
import { Config, Container } from "../interfaces";
import { AppService } from "../services/appService";

export class AppContainerBuilder implements ContainerBuilder {
    protected options: Config

    constructor(options: Config) {
        this.options = options
    }

    public async build(container: Container): Promise<void> {
        container.register('appService', asClass(AppService, { lifetime: 'SINGLETON' }))
    }
}