import { Container, DomainEvent, EventHandler, EventHandlerSpec, Logger, MessageBus } from "~/interfaces"

export class LazyEventHandler<Body> implements EventHandler<Body> {
    private messageBus!: MessageBus

    constructor(
        private spec: EventHandlerSpec,
        private serviceKey: string,
        private container: Container
    ) {}
    get eventName() {
        return this.spec.eventName
    }
    get eventVersion() {
        return this.spec.eventVersion
    }

    usingMessageBus(owner: MessageBus): void {
        this.messageBus = owner
    }
    async handleEvent(event: DomainEvent<Body>): Promise<void> {
        const actualHandler = this.container.resolve<EventHandler<Body>>(this.serviceKey)
        actualHandler.usingMessageBus(this.messageBus)
        await actualHandler.handleEvent(event)
    }
}

export class LocalMessageBus implements MessageBus {
    private eventHandlers: Map<string, Map<number, Set<EventHandler<any>>>> = new Map()
    private logger: Logger

    constructor(eventHandlers: EventHandler<any>[] = [],  appLogger: Logger) {
        this.logger = appLogger

        for (let handler of eventHandlers) {
            this.subscribeToEvent(handler)
        }
    }

    async initialize(): Promise<void> {}
    async dispose(): Promise<void> {}

    async publishEvent<Body = unknown>(event: DomainEvent<Body>): Promise<boolean> {
        const versionedHandlers = this.eventHandlers.get(event.name)?.get(event.version)
        const eventInfo = { eventName: event.name, eventVersion: event.version }

        if (!versionedHandlers || versionedHandlers.size === 0) {
            this.logger.debug('DomainEventUnhandled', eventInfo)
            return false
        }

        try {
            await Promise.all([...versionedHandlers].map((handler) => handler.handleEvent(event)))
            this.logger.debug('DomainEventHandled', eventInfo)
        } catch (error) {
            this.logger.error('DomainEventError', { ...eventInfo, error })
            // throw error
        }

        return true
    }



    subscribeToEvent(eventHandler: EventHandler<unknown>) {
        if (!this.eventHandlers.has(eventHandler.eventName)) {
            this.eventHandlers.set(eventHandler.eventName, new Map())
        }

        const versionMap = this.eventHandlers.get(eventHandler.eventName)!
        if (!versionMap.has(eventHandler.eventVersion)) {
            versionMap.set(eventHandler.eventVersion, new Set())
        }
        eventHandler.usingMessageBus(this)
        versionMap.get(eventHandler.eventVersion)!.add(eventHandler)
        this.logger.debug('EventHandlerSubscribed', this.handlerInfo(eventHandler))
    }

    private handlerInfo(eventHandler: EventHandler<unknown>): Record<string, any> | undefined {
        return {
            eventName: eventHandler.eventName,
            eventVersion: eventHandler.eventVersion,
            handlerName: eventHandler.constructor.name,
        }
    }

    unsubscribeFromEvent(eventHandler: EventHandler<unknown>) {
        const versionMap = this.eventHandlers.get(eventHandler.eventName)
        if (!versionMap) return

        const handlerSet = versionMap.get(eventHandler.eventVersion)
        if (!handlerSet) return

        handlerSet.delete(eventHandler)

        // Clean up empty sets/maps
        if (handlerSet.size === 0) versionMap.delete(eventHandler.eventVersion)
        if (versionMap.size === 0) this.eventHandlers.delete(eventHandler.eventName)

        this.logger.debug('EventHandlerUnsubscribed', this.handlerInfo(eventHandler))
    }


}