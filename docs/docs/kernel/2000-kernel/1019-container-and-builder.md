---

title: The Container and ContainerBuilder
sidebar_label: The Container and ContainerBuilder
---
The dependency injection container is the backbone of the kernel-based application architecture. It centralizes dependency management and promotes a clean, modular structure. Under the hood, this kernel uses [Awilix](https://github.com/jeffijoe/awilix), but you won’t need to interact with it directly unless you want to.

## What is the Container?
The container is where your application services (e.g., loggers, database clients, services) are registered. It’s also how dependencies are resolved during request handling. You define your own `Container` type based on your app’s services, enabling full type safety throughout the codebase.

---
## The `ContainerBuilder`

The `ContainerBuilder` is responsible for constructing and configuring the application container. This includes:

 - Registering core services
 - Adding feature modules
 - Providing access to the composed container for the kernel

Example:
```ts
// containerBuilder.ts

import { createContainer, asClass, asFunction, asValue } from 'awilix'

export class ContainerBuilder extends Kernel.AbstractContainerBuilder<Container> {

    async buildMainContainer(container: Container): Promise<void> {
        container.register({
            config: asValue(appConfig),
            logger: asFunction(createLogger).singleton(),
            db: asFunction(createDatabaseConnection).singleton(),
            // ...
        })
    }

    getModules(): ContainerModule[] {
        return [ new UserModule() ]
    }

}
```
### Registering Services
You typically use a combination of Awilix’s `asValue`, `asFunction`, and `asClass`:
```ts
container.register({
    userService: asClass(UserService).scoped(),
    db: asFunction(createDatabaseConnection).singleton(),
    config: asValue(appConfig)
   })
```
Service lifetimes:

 - `singleton`: One instance per app lifecycle
 - `scoped`: One instance per request
 - `transient`: New instance every time it is resolved

---

## Feature modules
Feature modules can encapsulate their own services and event handlers using the `ContainerModule` interface:

```ts
export class UserModule implements ContainerModule {
    getName() { return 'UserModule' }

    configure(container) {
        container.register({
                userService: asClass(UserService).scoped()
            })
        }

    getEventHandlers() { return [] }
}
```

These are returned from `getModules()` in your container builder and are automatically applied.

---

## Advanced: `ContainerModule` Generics – `Exports` and `Imports`

To promote strong typing and modular architecture, the ContainerModule interface accepts two generic parameters:
```ts
ContainerModule<Exports extends {}, Imports extends AppServices = AppServices>
```
These allow you to:

 - Declare what services a module provides (`Exports`)
 - Specify what services a module depends on (`Imports`)

This design encourages clear separation of concerns and improves type safety across the application.

## Declaring Exports and Imports
```ts
// services/UserService.ts
export class UserService {
  // ...
}
```

```ts
// modules/UserModule.ts
import { ContainerModule } from '@avanzu/kernel'

export interface UserModuleExports {
  userService: UserService
}

export interface UserModuleImports {
  logger: Logger
}

export class UserModule
  implements ContainerModule<UserModuleExports, UserModuleImports> {

  getName() {
    return 'UserModule'
  }

  configure(container) {
    container.register({
      userService: asClass(UserService).scoped()
    })
  }

  getEventHandlers() {
    return []
  }
}

```
In this case:

 - The module exports a `userService`.
 - The module expects a `logger` to already be registered.

### Composing the Full Container
You can build up your application’s full container type using intersections of all module exports:

```ts
import { UserModuleExports } from './modules/UserModule'
import { AuthModuleExports } from './modules/AuthModule'

export type Services =   UserModuleExports &  AuthModuleExports

export type Container = AwilixContainer<Services>
```
### Why It Matters

This strategy:

 - Helps to prevents circular dependencies by making module contracts explicit
 - Allows the kernel to guide static analysis and auto-complete
 - Makes it easier to onboard new developers by surfacing module boundaries

### Optional Runtime Checking
While the kernel doesn't enforce runtime verification of Imports, you could write helper tooling to verify those constraints during development if needed. But typically, TypeScript alone is sufficient here.