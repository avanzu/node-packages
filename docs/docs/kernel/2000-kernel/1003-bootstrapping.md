---

title: Bootstrapping
sidebar_label: Bootstrapping
---

The entrypoint to your application is typically handled in a `main.ts` file. This is where your configuration is loaded, the application kernel is instantiated, and the application lifecycle is controlled (booting, serving, and graceful shutdown).

---

## Example `main.ts`

```ts
import { Config } from './application/config'
import { ConfigValues } from './application/interfaces'
import { AppKernel } from './application/kernel'
import { environments } from './configuration'

;(async function main() {
    let configValues: ConfigValues

    try {
        const env = process.env.NODE_ENV || 'development'
        if (false === environments.has(env)) {
            throw new Error(`Unable to locate configuration for environment "${env}".`)
        }

        configValues = environments.get(env)!
    } catch (error) {
        console.error(error)
        process.exit(1)
    }

    const config = new Config(configValues)
    const kernel = new AppKernel(config)

    process.on('SIGTERM', kernel.shutdown.bind(kernel))
    process.on('SIGINT', kernel.shutdown.bind(kernel))

    try {
        await kernel.boot()
    } catch (error) {
        console.error(error)
        process.exit(2)
    }

    try {
        await kernel.serve()
    } catch (error) {
        console.error(error)
        process.exit(3)
    }
})()
```
----
## What this does
**Load Configuration**
Based on the `NODE_ENV` value, it selects a config object from the available environments.

**Initialize Kernel**
Instantiates the subclass of your abstract Kernel, passing it the validated Config instance.

**Register Signal Handlers**
Gracefully shuts down the server and container when the process receives `SIGTERM` or `SIGINT`.

**Boot the Application**
Invokes `kernel.boot()` to prepare the container, middleware, and routes.

**Serve**
Finally, starts the HTTP server via `kernel.serve()`.

## Error Handling
The application exits with a specific exit code for each stage:

 - 1 — Failed to load configuration
 - 2 — Failed during kernel boot
 - 3 — Failed to serve the HTTP server

