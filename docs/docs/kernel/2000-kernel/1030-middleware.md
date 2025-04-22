---

title: Middleware
sidebar_label: Middleware
---
Middleware functions in web applications handle requests and responses, performing tasks like logging, authentication, and validation. They enhance modularity and reusability, allowing developers to easily add or modify functionality.

### Creating middlewares
In order to create a custom middlware, you can mainly follow the [koa](https://koajs.com/) documentation.
However, instead of using the types provided by koa, you will mostly use the shorthand declarations from [getting started](#getting-started). Additionally, you will have access to your DIC in the `scope` property in the context object.

Assuming that you have your interfaces moved into `./src/application/interfaces`, lets build a middleware that logs incoming requests.

```ts
// ./src/application/middlware/logRequests.ts

import { Next } from 'koa'
import { Context, Middleware } from '~/application/interfaces'

export function logRequests() : Middleware {
    return async function writeRequestLog(context: Context, next: Next) {
        const logger = context.scope.cradle.appLogger
        await next()
        logger.info(`${context.method} ${context.path} - ${context.status}`)
    }
}
```
> [!NOTE]
> it is totally fine to use arrow functions instead of named ones if you prefer the syntax.<br/>However, named functions provide the additional benefit to have their names show up in the stack trace which makes debugging much easier.

### Adding middlewares
Since the server component is a koa application, you can use any pre made middleware from the koa ecosystem.

#### Application wide
In order to add application wide middlewares, you can overwrite the `middlewares()` method in your kernel.

As an example, let's integrate `@koa/bodyparser` and `koa-helmet`

Install dependencies
```bash
npm i @koa/bodyparser koa-helmet
```
Extend your kernel class
```ts
// ./src/application/kernel.ts

import { bodyParser } from '@koa/bodyparser'
import koaHelmet from 'koa-helmet'
// ...

export class MyProjectKernel extends Kernel.Kernel<Config, App, Container> {
    // ....
    protected middlewares() : Kernel.Middleware[] {

        return [
            koaHelmet(),
            bodyParser()
        ]
    }
}
```
#### Controller wide
In order to add middleware to every endpoint of a controller, you can add them in the `Controller` decorator.

Let's add our `logRequests` middleware to our `AppController` for example.
```ts
import * as Kernel from '@avanzu/kernel'
import { logRequests } from '~/application/middleware'
// ...
@Kernel.Controller('', logRequests()) // add additional middlewares as needed
export class AppController {
    // ...
}
```
#### Endpoint isolated
Attaching a middleware to a single endpoint is pretty much the same deal as attaching it to a controller.
Simply add them to the decorator for that endpoint.
```ts
import * as Kernel from '@avanzu/kernel'
import { logRequests } from '~/application/middleware'
// ...
@Kernel.Controller() // add additional middlewares as needed
export class AppController {
    // ...
    @Kernel.Get('/health', logRequests())
    async healthCheck(context: Context) {
        context.body = 'OK'
    }
}
```