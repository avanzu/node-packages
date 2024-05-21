# `@avanzu/kernel`

The package provides a robust foundation for creating scalable (micro-)services applications. It features a modular architecture, leveraging dependency injection for managing application components, and supporting middleware for handling HTTP requests and responses. The package is designed to promote clean, maintainable code and facilitate easy integration of additional functionality, making it ideal for building both simple and complex services.

> **Attention:** If you are not interested in the introduction, feel free to use the [quickstart project](https://github.com/avanzu/kernel-basic) to get right into development.
>
- [Getting started](#getting-started)
  - [Create boilerplate code](#create-boilerplate-code)
- [Refactoring: divide and conquer](#refactoring-divide-and-conquer)
  - [Folder structure breakdown](#folder-structure-breakdown)
  - [Build configuration](#build-configuration)
  - [Loading controller code](#loading-controller-code)
- [Middlewares](#middlewares)
  - [Creating middlewares](#creating-middlewares)
  - [Adding middlewares](#adding-middlewares)
    - [Application wide](#application-wide)
    - [Controller wide](#controller-wide)
    - [Endpoint isolated](#endpoint-isolated)
- [UseCases](#usecases)
  - [Creating UseCases](#creating-usecases)
  - [Interface implementations](#interface-implementations)
    - [User entity](#user-entity)
    - [MD5Authenticator](#md5authenticator)
    - [InMemoryUserRespository](#inmemoryuserrespository)
  - [Application integration](#application-integration)
    - [Application level interfaces](#application-level-interfaces)
    - [ContainerBuilder](#containerbuilder)
    - [Controller](#controller)
    - [Mixed approach](#mixed-approach)


## Getting started


Create a new typescript enabled project.

```bash
mkdir <myproject> && cd <myproject>

npm init

npm i -D typescript

npx tsc --init
```
Make sure to enable experimental decorators.
```jsonc
// tsconfig.json
{
    "compilerOptions" : {
        //...
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
    }
}
```

Install dependencies

```bash
npm i @avanzu/kernel jsonwebtoken pino
```

Install minimum dev dependencies

```bash
npm i -D @types/koa
```
Install additional (dev) dependencies as needed.

### Create boilerplate code

_The code snippets provided represent the absolute minimal codebase that has to be present in order for the kernel to run. As such, they are organized as if everything was in one single file.<br/>However, it is highly recommended to split the codebase into separate files and folders._

Extend interfaces provided by the kernel to simplify tying in your application later on.

```ts
// kernel.ts

import * as Kernel from '@avanzu/kernel'

// declare configuration options that your application needs
interface ConfigValues extends Kernel.ConfigOptions {}

interface Configuration extends Kernel.Configuration<ConfigValues> {}

// declare services that will be managed by your DIC to help with type safety during development
interface Services extends Kernel.AppServices {
    appLogger: Kernel.Logger,
    appConfig: Configuration
}

// extend kernel interfaces to use as shorthand during development
interface Container extends Kernel.Container<Services> {}
interface State extends Kernel.AppState<Container> {}
interface Context extends Kernel.AppContext<Container, State> {}
interface App extends Kernel.App<Container, State, Context> {}
```

You will need to provide an implementation for the Configuration interface.

The `Config` class centralizes application settings, enabling consistent configuration management across the application.
It simplifies access to configuration values and supports environment-specific settings, enhancing maintainability and scalability.

__minimal example__
```ts
export class Config implements Kernel.Configuration<ConfigValues> {
    constructor(protected values: ConfigValues) {}

    get<P extends keyof ConfigValues>(key: P): ConfigValues[P] {
        if (!(key in this.values) || null == this.values[key]) {
            throw new Error(`Key ${key} is not configured`)
        }
        return this.values[key]
    }
}
```

Next, you need to create your container builder.

The `ContainerBuilder` class facilitates dependency injection by managing the creation and lifecycle of application components. It ensures that dependencies are provided efficiently and promotes loose coupling, making the application easier to test and extend.

For detailed instructions on how to register dependencies, see the [awilix](https://github.com/jeffijoe/awilix) and the [awilix-manager](https://github.com/kibertoad/awilix-manager) documentation.
```ts

import { asValue } from 'awilix'

export class ContainerBuilder implements Kernel.ContainerBuilder<Container> {

    constructor(protected options: Config, protected logger: Kernel.Logger) {}

    async build(container: Container): Promise<void> {
        // register dependencies as usual in awilix
        container.register('appLogger', asValue(this.logger))
        container.register('appConfig', asValue(this.options))
    }
}
```

Now, yo are able to create your application kernel.

For sake of simplicity, we use the builtin `PinoLogger` as our application logger.
If you would prefer a different logging solution, feel free to replace it.

```ts
export class MyProjectKernel extends Kernel.Kernel<Config, App, Container> {

    protected createContainerBuilder(): Kernel.ContainerBuilder {
        return new ContainerBuilder(this.options, this.logger)
    }

    protected createLogger(): Kernel.Logger {
        return new Kernel.PinoLogger({})
    }
}
```

With all that in Place, you can start to create your Controllers, UseCases and any service that is required by them.

Let's create a simple Controller that acts as a healthcheck.

```ts
@Kernel.Controller()
export class AppController {

    @Kernel.Get('/health')
    async healthCheck(context: Context) {
        context.body = 'OK'
    }
}
```
> Controllers don't have to be explicitly registered in the DIC. However, you still have to make sure, that the code is present when the application starts so that the application is arware of them.


Finally, you need an entrypoint that creates and launches your application.

```ts
;(async function main() {
    const config = new Config({
        host: '0.0.0.0',
        port: 3000,
        namespace: '',
        resources: {}
    })

    const kernel = new MyProjectKernel(config)

    process.on('SIGTERM', kernel.shutdown.bind(kernel))
    process.on('SIGINT', kernel.shutdown.bind(kernel))

    try {
        await kernel.boot()
    } catch (error) {
        console.error(error)
        process.exit(1)
    }

    try {
        await kernel.serve()
    } catch (error) {
        console.error(error)
        process.exit(2)
    }
})()
```
Assuming that you have, in fact, pasted all of the snippets into a single file (`index.ts`), you should now be able to build an launch your application.

```bash
npx tsc && node ./main.js
```
You should see a log line in your terminal similar to this one
```json
{
    "level": 30,
    "time": 1716097817769,
    "pid": 1552845,
    "hostname": "...",
    "host": "0.0.0.0",
    "port": 3000,
    "url": "http://0.0.0.0:3000",
    "msg": "Server running"
}
```
With your server running, you are now able to call your health check.
You can use your browser to do so or use something like curl or httpie in your terminal.

```bash
curl -v localhost:3000/health
*   Trying 127.0.0.1:3000...
* Connected to localhost (127.0.0.1) port 3000 (#0)
> GET /health HTTP/1.1
> Host: localhost:3000
> User-Agent: curl/7.81.0
> Accept: */*
>
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
< Content-Type: text/plain; charset=utf-8
< Content-Length: 2
< Date: Sun, 19 May 2024 05:56:00 GMT
< Connection: keep-alive
< Keep-Alive: timeout=5
<
* Connection #0 to host localhost left intact
OK
```
## Refactoring: divide and conquer
In order to provide a maintainable codebase, the recommended structure for your application would look something like this.

_Feel free to modify file and folder names to your liking and/or naming conventions._
```
myproject/
    package.json
    tsconfig.json
    src/
        main.ts
        domain/
            entities/
            features/
            services/
        infrastructure/
            index.ts
        configuration/
            default.ts
            test.ts
            production.ts
            development.ts
        application/
            kernel.ts
            controllers/
                appController.ts
                index.ts
            dependencyInjection/
                containerBuilder.ts
                index.ts
            middleware/
            modules/
                configuration/
                    config.ts
            services/
```
### Folder structure breakdown
Locating your codebase in a `src/` folder allows to separate typescript files and typescript bild artifacts.

Inside of the sources folder, we organize horizontally in terms of abstraction layer. The folder structure inside of each layer is a suggestion but ultimately up to you.

- `domain/` - contains code that revolves around the buisness- or problem domain.<br/>Code in here has a very high abstraction level and should have no reason to import anything outside of the `domain` folder.<br/>Use interfaces to describe dependencies that your domain needs to function without them being part of the domain layer.
  - `entities/` - Your domain models
  - `features/` - business centric use cases
  - `services/` - reusable behavior that can be shared amongst multiple use cases
- `infrastructure/` - contains concrete, technology centric implementations of the interfaces declared in the domain layer.
- `configuration/` - contains your application configuration. This setup assumes that you will run your application in different `NODE_ENV` environments which will have different configuration values.
- `application/` - contains application specific code like controllers, middlewares and the container builder.<br/>Here you will wire the abstractions of the domain layer with the concrete implementations of the infrastructure layer.
  - `kernel.ts` - your application kernel that manages the application lifecycle.
- `main.ts` - the entrypoint of your application that loads the configuration, initializes and runs the kernel.

### Build configuration
With this setup, the `tsconfig.json` needs some adjustments.
```jsonc
{
    "include": ["src"],
    "compilerOptions": {
        // ...
        "outDir": "./dist",
        "paths": {
            "~/*": ["./src/*"]
        }
    }
}
```
In order to use path mappings properly, we need some additional tooling.
```bash
npm i -D tsc-alias
```

Now let's add some scripts to your package.json to simplify the build process
```json
{
    "scripts": {
        "build": "tsc -p tsconfig.json",
        "postbuild": "tsc-alias -p tsconfig.json",
        "start": "node ./dist/main.js"
    }
}
```
> **Attention:** Although being very convenient, you don't have to use path mappings if you want to avoid the additional tooling that is required in the build process.

You should be able to divide an distribute the contents of our `index.ts` from [Getting started](#getting-started) into individual modules.

### Loading controller code
As mentioned before, you don't have to register controllers explicitily in your container but the code itself needs to be loaded when the application starts.

In order to do so, make sure to barrel your controllers in an `index.ts` in your controllers folder which exports every controller.

Now you can import the barrel in your `containerBuilder.ts`
```ts
// ./src/application/dependencyInjection/containerBuilder.ts

import '~/application/controllers'
```
That way, when you add more controllers, you don't have to modify the`containerBuilder.ts` each time. Just make sure to add them to the exports of your `index.ts` barrel in the `controllers/` folder.

## Middlewares
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
> **Notice:** it is totally fine to use arrow functions instead of named ones if you prefer the syntax.<br/>However, named functions provide the additional benefit to have their names show up in the stack trace which makes debugging much easier.

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

## UseCases
In concept, a UseCase is responsible for handling a single, well-defined action or task within the domain. UseCases are designed to be isolated from the application and infrastructure layers, ensuring a clear separation of concerns within your architecture.

While the application kernel requires UseCases to be implemented as classes, it does not impose strict technical constraints on their structure beyond this requirement. This flexibility allows developers to design UseCases in a way that best suits their specific needs and domain logic.

To ensure consistency and interoperability across different UseCase implementations, it is recommended to define a common interface that all UseCases should follow. This interface standardizes how UseCases are invoked and handle input and output, making it easier to integrate them within the application layer.

One example for such an interface might look like this

```ts
export interface Feature<Input = any, Output = any> {
    invoke(value: Input): Promise<Output>
}
```

### Creating UseCases

Assuming that you are using an interface similar to the one provided as example, let's imagine that the problem domain revolves around authentication.

One such single, well-defined operation could be a user login.

```ts
// ./src/domain/features/loginFeature.ts

import * as Kernel from '@avanzu/kernel'

export type LoginInput = {
    username: string
    password: string
}

export type LoginOutput = {
    token: string
    userId: string
}

@Kernel.UseCase({ id: 'login' })
export class LoginUseCase implements Feature<LoginInput, LoginOutput> {

    constructor(
        private userRepository: UserRepository,
        private authenticator: Authenticator
    ){}

    async invoke(value: LoginInput) : Promise<LoginOutput> {

        const user = await this.userRepository.findByUsername(value.username)
        const passwordHash = this.authenticator.hashPassword(value.password)
        if(user.password === passwordHash) {
            const token = await this.authenticator.createToken(user)
            return { token, userId: user.id }
        }
        throw new Error('NotAuthenticated')
    }
}

```
The UseCase itself is a relatively simple class. What makes it a UseCase from the kernel perspective is the `UseCase` annotation. Similar to the `Controller` annotation,
it causes the kernel to register that class as a UseCase.
This will come in handy when we integrate it into the application layer later on.

As you may have noticed, this UseCase expects two dependencies to be injected. Both of them revolve around a third type, the `user` which also needs to be defined.

Let's start to define the `User` interface which both components rely on. At least so far as we can extrapolate by now.

```ts
// ./src/domain/interfaces/user.ts
export interface User {
    id: string
    username: string
}
```
Now, we can declare the remaining two interfaces based on how we intend to use them in our UseCase.

```ts
// ./src/domain/interfaces/authenticator.ts
import type { User } from './user'

export interface Authenticator {
    createToken(user: User) : Promise<string>
    hashPassword(passwordString: string) : string
}
```
```ts
// ./src/domain/interfaces/userRepository.ts
import type { User } from './user'

export interface UserRepository {
    findByUsername(username: string) : Promise<User>
}
```
That's almost all we need to do in the domain layer.

### Interface implementations
Now that we have declared our interfaces, we need to provide at least one concrete implementation in order to end up with a working login feature.

> **Attention:** keep in mind, that the following implementations are kept extremely simple and only serve demonstrative purposes in context of this document.

#### User entity
Since the `User` is apparently a concept that exists in the business domain, the concrete implementation of the interface also needs to exist in the domain layer, we could replace the interface with a concrete entity class.

```ts
// ./src/domain/entities/user.ts

export class User {
    id!: string
    username!: string
    password!: string

    constructor(id?: string, username?: string, password?: string) {
        this.id = id
        this.username = username
        this.password = password
    }
}
```
#### MD5Authenticator
In the spirit of keeping things simple, we implement the authenticator interface which used and MD5 hash to authenticate the given user with the given passowrd string.

```ts
import type { Authenticator } from '~/domain/interfaces'
import { User } from '~/doamin/entities'
import { createHash, randomBytes } from 'node:crypto'

export class MD5Authenticator implements Authenticator {

    async createToken(user: User) : Promise<string> {
        return randomBytes(65).toString('hex')
    }

    hashPassword(passwordString: string): string {
        return createHash('md5').update(passwordString).digest('hex')
    }
}
```

#### InMemoryUserRespository
To keep it relatively simple, we first impelement the `UserRepository` as in memory storage.

```ts
// ./src/infrastructure/inMemoryUserRepository.ts

import type { UserRepository, Authenticator } from '~/domain/interfaces'
import { User } from '~/domain/entities'

export class InMemoryUserRepository implements UserRepository {
    private users: User[]
    constructor(private authenticator: Authenticator) {
        this.users = [
            new User(
                '012ae4d3',
                'Joseph',
                authenticator.hashPassword('qtZm4vzVv7')
            )
        ]
    }

    async findByUsername(username: string) : Promise<User> {
        const user = this.users.find((user) => user.username === username)
        if(false === Boolean(user)) {
            throw new Error('UserNotFound')
        }

        return user
    }
}
```
### Application integration
Now that we have our indivdual parts, we need to bring them together in the application layer.

#### Application level interfaces
We intend to utilise our dependency injection container, we need to extend our `Services` interface in order to remain type safe.

```ts
import type { Authenticator, UserRepository } from '~/domain/interfaces'

interface Services extends Kernel.AppServices {
    userRepository: UserRepository
    authenticator: Authenticator
}
```
Instead of doing it this way, we could also declare a `DomainServices` interface in the domain layer and have our `Services` interface extend both.

#### ContainerBuilder
In our container builder we register the concrete implementations that we intend to use and make the application aware of our usecases.
```ts
// ./src/application/dependencyInjection/containerBuilder.ts

import { asValue, asClass } from 'awilix'
import {InMemoryUserRepository, MD5Authenticator } from '~/infrastructure'
// ...
import '~/domain/features'

export class ContainerBuilder implements Kernel.ContainerBuilder<Container> {
    // ...
    async build(container: Container): Promise<void> {
        // ...
        container.register('userRepository', asClass(InMemoryUserRepository))
        container.register('authenticator', asClass(MD5Authenticator))
    }
}
```
#### Controller
Depending on how you intend to design your api endpoints, you can approach the controller implementation differently.

##### UseCase Dispatcher
This approach goes for one single endpoint that handles every registered usecase.

```ts
import { Context } from '~/application/interfaces'
import * as Kernel from '@avanzu/kernel'

@Kernel.Controller('/features')
export class UseCaseDispatcher {

    @Kernel.All('/:useCaseId')
    async dispatch(context: Context) {
        const useCaseInfo = Kernel.getUseCase(context.params.useCaseId)
        if(false === Boolean(useCaseInfo)) {
            context.throw(404)
        }

        const useCase = context.scope.build(useCaseInfo.useCase)
        const input = context.method === 'get' ? context.query : context.body
        context.body = await useCase.invoke(input)
    }
}
```
**Pros:**
 - **Flexibility:** Handles various UseCases dynamically,
making it ideal for smaller applications or those with rapidly changing UseCase requirements.
- **Unified Endpoint:** Simplifies routing logic by having a single endpoint for all UseCases.

**Cons:**

- **Complex Input Handling:** Requires additional logic to manage different input types and methods.
Less Granular Control: Harder to enforce specific validation, authentication, and authorization rules per UseCase.

##### UseCase specific
This approach provides multiple endpoints where each one is responsible to handle exactly one usecase.

```ts
import { Context } from '~/application/interfaces'
import * as Kernel from '@avanzu/kernel'

@Kernel.Controller('/authentication')
export class AuthenticationController {

    @Kernel.Post('/signin')
    async handleSignIn(context: Context) {

        const useCaseInfo = Kernel.getUseCase('signin')

        if(false === Boolean(useCaseInfo)) {
            context.throw(404)
        }

        const useCase = context.scope.build(useCaseInfo.useCase)
        context.body = await useCase.invoke(context.body)
    }
}
```
**Pros:**
- **Granular Control:** Easier to apply specific validation, authentication, and authorization rules for each endpoint.
- **Clear Structure:** Each endpoint has a clear purpose, making the codebase easier to understand and maintain.
- **Simplified Error Handling:** More straightforward error handling tailored to each specific UseCase.

**Cons:**
- **Increased Boilerplate:** Requires more code to set up individual endpoints for each UseCase.
- **Scalability Challenges:** Adding new UseCases involves creating new endpoints and potentially duplicating code.

#### Mixed approach
You could also adopt a mixed strategy, using the dispatcher for quick progression during the early development stages and transitioning to the UseCase-specific strategy as your application grows or when you encounter UseCases with different requirements that the dispatcher cannot accommodate.

