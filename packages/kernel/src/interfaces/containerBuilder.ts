import { Container } from "./container";

export interface ContainerBuilder<DIC extends Container> {
    build(container: DIC) : Promise<void>
}