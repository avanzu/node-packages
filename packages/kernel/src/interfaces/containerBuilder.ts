import { AwilixContainer } from "awilix";

export interface ContainerBuilder {
    build(container: AwilixContainer) : Promise<void>
}