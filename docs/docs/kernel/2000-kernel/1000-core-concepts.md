---

title: Core concepts
sidebar_label: Core concepts
---

This section covers the fundamental building blocks provided by the `@avanzu/kernel` package.

---

## Kernel

The kernel acts as the central coordinator for your application’s startup lifecycle. It initializes:

- The dependency injection container
- Middleware and routing
- Lifecycle-aware services
- Optional event handlers via the message bus

The kernel doesn’t enforce an application structure — it just wires things together based on what you plug in.

---

## Container Modules

A `ContainerModule` encapsulates a cohesive set of services or a feature slice. It defines a contract for what it **registers** and **depends on**, and optionally provides event handlers.
```ts
interface ContainerModule<Exports, Imports> {
  getName(): string
  configure(container: Container<Exports & Imports>): void
  getEventHandlers(): EventHandlerSpec[]
}
```
This makes feature boundaries explicit and modular.

---

## AbstractContainerBuilder

The `AbstractContainerBuilder` is a convenience base class that implements the `ContainerBuilder` interface. It wires together multiple `ContainerModule`s and gives you hooks to:

- Register modules
- Add middleware
- Configure the message bus

You can override the following methods:
```ts
abstract class AbstractContainerBuilder<TContainer> {
  getModules(): ContainerModule<any>[] { /* ... */ }

  configureContainer(container: TContainer): void { /* optional */ }

  getMiddlewares(): Middleware[] { /* optional */ }
}
```
Using this base class is optional — you're free to roll your own builder as long as it matches the interface.
