export type DomainEvent<EventBody, EventType = string> = {
    name: EventType
    version: number
    body: EventBody
}

export interface MessageBus {
    initialize(): Promise<void>;
    dispose(): Promise<void>;
    publishEvent<EventBody = unknown>(event: DomainEvent<EventBody>): Promise<boolean>;
    subscribeToEvent(eventHandler: EventHandler<unknown>): void;
    unsubscribeFromEvent(eventHandler: EventHandler<unknown>): void;
}


export interface EventHandler<EventBody, EventType = string> {
    eventName: EventType
    eventVersion: number
    handleEvent(event: DomainEvent<EventBody, EventType>): Promise<void>
    usingMessageBus(owner: MessageBus): void
}

