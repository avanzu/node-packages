A pragmatic and extensible application kernel for TypeScript/Node.js projects.

Designed for structure, composability, and maintainability—without sacrificing performance or predictability.

## Features

- 🔧 Lifecycle orchestration (`boot`, `serve`, `shutdown`)
- ⚙️ Dependency injection-friendly
- 📚 Built-in support for metadata via decorators
- 🧩 Plugin-ready via method hooks
- 📄 OpenAPI-ready controllers (optional)

## Installation

```bash
npm install @avanzu/kernel
```

## Entry Point Overview
This package provides the infrastructure to build a modular, maintainable application, but does not include a ready-to-run setup. You are expected to define your own configuration layer and kernel extension.

Here’s what a possible entry point could look like once things are scaffolded:

```ts
import { Config } from './application/config'
import { AppKernel } from './application/kernel'
import { environments } from './configuration'

(async function main() {
  const env = process.env.NODE_ENV || 'development'
  const configValues = environments.get(env)
  const config = new Config(configValues)
  const kernel = new AppKernel(config)

  process.on('SIGINT', kernel.shutdown.bind(kernel))
  process.on('SIGTERM', kernel.shutdown.bind(kernel))

  await kernel.boot()
  await kernel.serve()
})()

```
### Want to see how that scaffolding works?
👉 [Minimal setup guide](https://avanzu.github.io/node-packages/docs/kernel/guides/scaffolding/minimal)

👉 [Layered setup guide](https://avanzu.github.io/node-packages/docs/kernel/guides/scaffolding/layered)

👉 [FeatureSlice setup guide](https://avanzu.github.io/node-packages/docs/kernel/guides/scaffolding/sliced)


## Documentation
Comprehensive documentation and integration guides available at:

👉 [avanzu.github.io](https://avanzu.github.io/node-packages/docs/kernel/welcome/index)

