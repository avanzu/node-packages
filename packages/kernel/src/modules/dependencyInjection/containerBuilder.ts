import { asClass, type BuildResolverOptions } from 'awilix'
import type { Container, ContainerBuilder, ContainerModule, ContainerModuleAware, EventHandlerSpec } from '~/interfaces'
import * as Bus from '../messageBus'

export abstract class AbstractContainerBuilder<DIC extends Container>
    implements ContainerBuilder<DIC>, ContainerModuleAware
{
    protected abstract buildMainContainer(container: DIC): Promise<void>

    getModules(): ContainerModule<any>[] {
        return []
    }

    async build(container: DIC): Promise<void> {
        this.buildMainContainer(container)

        for (let containerModule of this.getModules()) {
            containerModule.configure(container)
            for (let spec of containerModule.getEventhandlers()) {
                let serviceKey = [
                    containerModule.getName(),
                    spec.eventName,
                    spec.eventVersion,
                ].join('_')

                container.register(serviceKey, spec.resolver)
                this.registerLazyHandler(container, spec, serviceKey)
            }
        }
    }

    private registerLazyHandler(container: Container, spec: EventHandlerSpec, serviceKey: string) {
        let lazyKey = `lazy_${serviceKey}`

        const resolverOptions: BuildResolverOptions<Bus.LazyEventHandler<any>> = {
            lifetime: 'SINGLETON',
            tags: [Bus.ContainerTags.EventHandler],
        }

        const resolver = asClass(Bus.LazyEventHandler, resolverOptions)
        const injector = resolver.inject((container) => ({ spec, serviceKey, container }))

        container.register(lazyKey, injector)
    }
}
