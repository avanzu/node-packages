import type { Resolver } from 'awilix'
import type { AppServices, Container } from './container'
import type { EventHandler } from './messageBus'

export type EventHandlerSpec = {
    eventName: string
    eventVersion: number
    resolver: Resolver<EventHandler<any>>
}

export interface ContainerModuleAware {
    getModules(): ContainerModule<any>[]
}

export interface ContainerModule<Exports extends {}, Imports extends AppServices = AppServices> {
    getName(): string
    configure(container: Container<Imports & Exports>): void
    getEventhandlers(): EventHandlerSpec[]
}
