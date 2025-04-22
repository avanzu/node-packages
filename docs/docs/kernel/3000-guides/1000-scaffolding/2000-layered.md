---
title: Layered style
sidebar_label: Layered style
---
If you prefer to organize your codebase in a more traditional, layered style, the recommended structure would look something like this
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