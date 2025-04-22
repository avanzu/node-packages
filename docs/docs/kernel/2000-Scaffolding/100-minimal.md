---
title: Minimal
sidebar_label: Minimal
---

The code snippets provided represent the absolute minimal codebase that has to be present in order for the kernel to run. As such, they are organized as if everything was in one single file.

If that's too messy for your liking, feel free to create indiviual files for each snippet as you see fit.

## Create boilerplate code

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

export class ContainerBuilder extends Kernel.AbstractContainerBuilder<Container> {

    constructor(protected options: Config, protected logger: Kernel.Logger) {}

    async buildMainContainer(container: Container): Promise<void> {
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
## Run your server
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