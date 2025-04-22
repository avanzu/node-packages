---

title: Controllers
sidebar_label: Controllers
---
The @avanzu/kernel package uses a decorator-based approach to define route handlers in a modular, controller-centric way.

This provides:

 - Strong cohesion between route definitions and their logic
 - Easy route-level middleware integration
 - Better readability and separation of concerns

---
## Controller Declaration
A controller is a class decorated with @Controller(), where each method maps to a route.

Example:

```ts
import * as Kernel from '@avanzu/kernel'

@Kernel.Controller('/greet')
export class GreetController {

    @Kernel.Get('/')
    sayHello(context: Kernel.Context) {
        context.body = 'Hello, world!'
    }

    @Kernel.Post('/')
    greetUser(context: Kernel.Context) {
        const { name } = context.request.body
        context.body = `Hello, ${name}`
    }
}

```
> 💡 `@Controller(path)` will prefix all routes in the class with that path.

---
## Supported HTTP Verbs
You can decorate methods with any of the following:

 - `@Get(path)`
 - `@Post(path)`
 - `@Put(path)`
 - `@Delete(path)`
 - `@Patch(path)`

Each of these maps directly to the corresponding HTTP method.

---
## Middleware Per Route or Controller
Each controller or endpoint can have its own middleware stack.

```ts
@Kernel.Controller('/secure', authMiddleware())
export class SecureController {
    @Kernel.Get('/')
    dashboard(context: Kernel.Context) {
        context.body = 'Restricted content'
    }
}

```

You can even add route-level middleware:
```ts
@Kernel.Get('/admin', adminOnlyMiddleware(), logRequests())

```
This will execute the middlewares in order before the controller logic.

---
## Controller Discovery
Controllers in the kernel do not need to be registered indivually in the DI container. Instead, they are automatically discovered through the use of the `Controller` decorator.

However, for this to work, the controller code must be loaded into memory during the application startup.

### Best Practice: Use a Barrel File
To ensure all controllers are properly registered, you should re-export them in a barrel file (commonly `controllers/index.ts`) and import that file in your application’s main container setup:
```
📁 application/
 ┣ 📁 controllers/
 ┃ ┣ 📄 app.controller.ts
 ┃ ┣ 📄 health.controller.ts
 ┃ ┗ 📄 index.ts         <-- Export all controllers here
 ┣ 📄 kernel.ts
 ┗ 📁 dependencyInjection/
   ┗ 📄 containerBuilder.ts

```
Example of `controllers/index.ts`

```ts
export * from './app.controller'
export * from './health.controller'

```
Then, import it in your `containerBuilder.ts`

```ts
import '~/application/controllers'
```

> ✅ This ensures that all controller classes are registered at runtime without requiring manual updates to the container setup each time a new controller is added.
>
> However, you still need to update the barrel file to register new controllers.

---
## Dependency Injection (DI)
Controller classes support constructor-based injection for services or dependencies that are resolved at request time.

This is the preferred method, because:

 - Controllers are instantiated per request
 - Dependencies injected in the constructor are consistent with the DI container at the time of construction
 - It avoids manual container access, keeping code cleaner

```ts
export class StatusController {
    constructor(private readonly healthService: HealthService) {}

    @Kernel.Get('/status')
    check(context: Kernel.Context) {
        const result = this.healthService.check()
        context.body = result
    }
}

```
---

## Dependency Injection via Context

Sometimes, certain dependencies **may** become available after the controller has been constructed — for example, user-specific data that gets resolved in middleware and injected into the scope.

In such cases, you can access the `context.scope.cradle` manually.

Each controller method receives the enhanced `Context` object, which includes the scoped DI container:

```ts
@Kernel.Get('/me')
getUser(context: Kernel.Context) {
    const user = context.scope.cradle.user
    context.body = { id: user.id, name: user.name }
}

```
> ℹ️ Prefer constructor injection for static dependencies like services or use cases, and use `context.scope.cradle` only when dynamic or request-specific values are involved.