---

title: Message Bus Integration
sidebar_label: Message Bus Integration
---


The kernel provides optional integration with an internal message bus. This enables decoupled communication between container modules through event publishing and subscription.

---

## EventHandlerSpec

Container modules that wish to react to specific events can implement the `getEventHandlers()` method to return an array of `EventHandlerSpec`.
```ts
type EventHandlerSpec = {
  event: string
  handler: (payload: any, context: any) => Promise<void> | void
}
```
Each event handler is automatically registered to the bus if the message bus is available.

---

## Usage in a Container Module

You can opt into event handling by returning one or more handlers in your module:
```ts
getEventHandlers(): EventHandlerSpec[] {
  return [
    {
      event: 'user.registered',
      handler: async (payload) => {
        // handle the event
      }
    }
  ]
}
```
If no message bus is installed, this method is simply ignored — making event handling optional and non-intrusive.

---

## Customizing the Bus

The message bus is resolved from the container. To use a different implementation, bind your own under the `messageBus` token in your container configuration.

Example using a stubbed bus:
```ts
container.register({
  messageBus: asValue({
    publish: async () => {},  // noop
    subscribe: () => {}       // noop
  })
})
```
---

## Summary

- Event handling is optional and modular
- Modules declare interest via `getEventHandlers()`
- No runtime error if no bus is present
- Custom buses are supported via container registration
