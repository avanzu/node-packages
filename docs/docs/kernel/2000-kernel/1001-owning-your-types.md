---

title: Owning Your Application Types
sidebar_label: Owning Your Application Types
---

The `@avanzu/kernel` exists to provide application structure without creeping into your domain logic. It lives at the *edges* of your system — managing controllers, lifecycle, middleware, and DI — but your core logic remains untouched by framework internals.

To support this, the kernel provides a set of generic and composable types that can be **redeclared in your application**, giving you **full control over types** like `Context`, `App`, `Middleware`, and `Container`.

## Why?

Most TypeScript-based frameworks tend to leak into your business logic through decorators, global types, or complex runtime behaviors. The kernel aims to avoid that by keeping everything pluggable and opt-in.

This separation allows:

- Full **type safety** in your application code
- A **clean dependency graph** (no deep kernel imports)
- Better **IDE and DX support** through tailored types
- Easier **testing and mocking**, as everything is explicit

---

## Example: Declaring Your Application Types

To make the kernel types specific to your app, you simply redeclare them with your own container or state types:

```ts
// ./src/application/kernel.ts

import * as Kernel from '@avanzu/kernel'

// Your application's container services
export interface Services {
  appLogger: Kernel.Logger
  // add more services...
}

// Optional: enhance the auth user model
export interface Principal extends Kernel.AuthUser {
  id: string
  roles: string[]
}

// Your dependency injection container
export interface Container extends Kernel.Container<Services> {}

// Your application state (per request)
export interface State extends Kernel.AppState<Container> {}

// Enhanced Koa context
export interface Context<Body = any> extends Kernel.AppContext<
  Container,
  State,
  Principal,
  Body
> {}

// Final app types
export interface App extends Kernel.App<Container, State, Context> {}
export interface Middleware extends Kernel.AppMiddleware<Container, State, Context> {}
export interface Logger extends Kernel.Logger {}
```
> These type declarations act as the boundary of your application. Everything inside can now refer to `Context`, `Middleware`, or `Container` without importing anything from the kernel.

---
## Declaring Request Body Types
You can enhance the Context type further to support strongly typed request bodies for POST/PUT operations:

```ts
async createUser(context: Context<{ username: string; password: string }>) {
  const { username, password } = context.request.body
  // ...
}

```
This gives you proper autocompletion and validation at compile time — without any runtime validation boilerplate (though you should still validate input before trusting it!).

---
## Controller Injections
These types will automatically apply inside controller classes, middleware, or any logic that consumes the context or DI container.

For example, when injecting via the constructor:

```ts
@Kernel.Controller()
export class AppController {
  constructor(private readonly logger: Logger) {}

  @Kernel.Get('/')
  async greet(context: Context) {
    this.logger.info('Greeting endpoint hit')
    context.body = 'Hello'
  }
}

```
Or via contextual access (if you need something like the authenticated user):

```ts
@Kernel.Get('/me')
async currentUser(context: Context) {
  const user = context.scope.cradle.user
  context.body = { id: user.id }
}
```
---
## Summary
You don’t have to use these extended types, but they’re highly recommended for any application of non-trivial size. They let you:

 - Keep `@avanzu/kernel` out of your core code
 - Get strong types tailored to your app
 - Avoid leaky abstractions
 - Build a future-proof codebase

The kernel stays at the boundary. You stay in control.