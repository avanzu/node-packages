import { asClass, BuildResolverOptions } from 'awilix'
import { AppServices, Container, ContainerModule, EventHandlerSpec, Logger } from '~/interfaces'
import { LocalMessageBus } from './messageBus'
import { getWithTags } from 'awilix-manager'
import { ContainerTags } from './containerTags'

export type MessageBusModuleExports = {}

export type MessageBusModuleImports = AppServices & {
    appLogger: Logger
}

export class MessageBusContainerModule
    implements ContainerModule<MessageBusModuleExports, MessageBusModuleImports>
{
    getName(): string {
        return this.constructor.name
    }

    configure(container: Container<AppServices>): void {

        const containerOptions: BuildResolverOptions<LocalMessageBus> = {
            lifetime: 'SINGLETON',
            asyncInit: 'initialize',
            asyncDispose: 'dispose',
        }

        const resolver = asClass(LocalMessageBus, containerOptions).inject((container) => ({
            eventHandlers: Object.values(getWithTags(container, [ContainerTags.EventHandler])),
        }))

        container.register('messageBus', resolver)
    }

    getEventhandlers(): EventHandlerSpec[] {
        return []
    }
}
