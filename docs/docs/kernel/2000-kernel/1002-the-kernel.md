---

title: The Kernel
sidebar_label: The Kernel
---

The `Kernel` class is the orchestration layer of your application. It serves as the entry point that initializes the container, prepares the Koa application, wires up middleware, and loads your controller routes.

This class is **abstract**, meaning it must be subclassed in the application to implement some required behavior, namely how the container and logger are created.

---

## Responsibilities

The Kernel is responsible for:

- Instantiating the application (`Koa`)
- Creating the dependency injection container (`awilix`)
- Registering application middlewares
- Loading annotated controllers
- Booting and serving the application
- Shutting down resources cleanly

---

## Key Lifecycle Methods

```ts
async boot(): Promise<void>
```
Initializes the DI container and middleware stack. Also loads all registered controllers.

```ts
async serve(): Promise<Server>
```
Starts the server using host and port options from the runtime config.

```ts
async shutdown(): Promise<void>
```
Disposes of the container and gracefully shuts down the HTTP server if it was started.

---

## Subclass Responsibilities

Your application must subclass Kernel and implement the following methods:
```ts
createContainerBuilder(): ContainerBuilder
```

Return an instance of your container builder that knows how to register modules into the DI container.
```ts
createLogger(): Logger
```
Return a logger instance (used for boot, runtime, error logging, etc.)

## Middleware Hook

```ts
protected middlewares(): Middleware[]
```
Return an array of Koa-compatible middleware to be mounted after core middlewares (error handling, authentication, and DI scope binding).

### Internal Middleware Stack
These middlewares are always applied first:

 - `errorHandler()` — catch unhandled errors and log them
 - `authenticateAnonymous()` — establish a default user context
 - `containerScope()` — bind the request lifecycle to the container

Then any user-defined middlewares from the subclass override are added.

## Controller Discovery

During `boot()`, the kernel calls `loadControllers()`.
This function mounts any routes found via the `@Controller` decorator, assuming the controller classes were already imported (e.g., via a barrel file).

The route prefix is determined from the configuration value of `namespace`.

## Container Creation
```ts
protected createContainer(): Container
```
Creates the base Awilix container with CLASSIC injection mode and strict resolution. Override only if you need custom container behavior.

```ts
protected async buildContainer(): Promise<void>
```
Uses the ContainerBuilder pattern to load and register modules. Each module should declare its expected imports and provided exports.

---
## Example subclass

```ts
import * as Kernel from '@avanzu/kernel'
import { App, Configuration, Container } from './interfaces'
import { ContainerBuilder } from './dependencyInjection'
import { bodyParser } from '@koa/bodyparser'
import { errorHandler, normalizeUrlPath } from './middleware';
import pino from 'pino';
export class AppKernel extends Kernel.Kernel<Configuration, App, Container> {

    protected loadControllers() {
        const prefix = this.options.get('namespace') ?? '';

        const router = Kernel.mountControllers(prefix.length ? `/${prefix}` : '');
        this.app.use(router.routes());
    }

    protected createContainerBuilder(): Kernel.ContainerBuilder<Container> {
        return new ContainerBuilder(this.options, this.logger)
    }

    protected createLogger(): Kernel.Logger {
        const options = this.options.get('logger')
        const appName = this.options.get('appName')

        return new Kernel.PinoLogger({
            formatters: {
                level: (label) => ({ severity: label.toUpperCase() }),
                bindings: (bindings) => ({ ...bindings, appName  })
            },
            timestamp: pino.stdTimeFunctions.isoTime,
            ...options
        })
    }

    protected middlewares(): Kernel.AppMiddleware<any, any, any>[] {
        return [ bodyParser(), normalizeUrlPath(), errorHandler(['/health']) ]
    }

}
```

