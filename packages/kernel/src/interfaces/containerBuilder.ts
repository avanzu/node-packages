import { Container } from "./container";

export interface ContainerBuilder {
    build(container: Container) : Promise<void>
}