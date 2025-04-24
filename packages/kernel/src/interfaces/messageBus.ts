export type DomainEvent<Body, EventType = string> = {
    name: EventType
    version: number
    body: Body
}

export interface MessageBus {
    initialize(): Promise<void>;
    dispose(): Promise<void>;
    publishEvent<Body = unknown>(event: DomainEvent<Body>): Promise<boolean>;
    subscribeToEvent(eventHandler: EventHandler<unknown>): void;
    unsubscribeFromEvent(eventHandler: EventHandler<unknown>): void;
}


export interface EventHandler<Body, EventType = string> {
    eventName: EventType
    eventVersion: number
    handleEvent(event: DomainEvent<Body, EventType>): Promise<void>
    usingMessageBus(owner: MessageBus): void
}

