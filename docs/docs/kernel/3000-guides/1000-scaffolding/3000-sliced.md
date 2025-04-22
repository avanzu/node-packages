---
title: FeatureSlice style
sidebar_label: FeatureSlice style
---

As an alternative structure and philosophy, your application can be organized around vertically sliced features (or "modules"), which aim to keep all related concerns together — rather than scattering them across architectural layers.

> **Hint:** If you intend to go *really* micro so that a single service is supposed to be a single feature, this section will most likely provide no benefit to you.

## Folder structure
```
myproject/
    src/
        main.ts
        application/
            kernel.ts
            controllers/
            dependencyInjection/
                containerBuilder.ts
                index.ts
        features/
            myfeature/
                entities/
                infrastructure/
                useCases/
                module.ts
```
In essence, your feature slices are internally layered just like the hexagonal approach. You just keep everything that logically belongs to a specific feature together in one place.

## The application layer
The `/application` folder remains almost exactly the same as with the hexagonal approach. We still need some place to integrate the individual parts.


### integration with container modules
To plug a feature slice into your application, define a `ContainerModule`.
```ts
// myproject/src/features/myfeature/module.ts
import * as Kernel from '@avanzu/kernel'
// declare which dependencies will be registered in the application container
export type MyFeatureExports = {}
// declare whih dependencies are expected to be available in the application container
export type MyFeatureImports = {}

export class MyFeatureContainerModule implements Kernel.ContainerModule<MyFeatureExports, MyFeatureImports> {

    getName(): string {
        // make sure to return a unique name.
        // Be cautious around bundlers which will often rename classes
        return this.constructor.name
    }

    configure(container: Kernel.Container<MyFeatureExports & MyFeatureImports>) : void {
        // register your exports
    }

    getEventhandlers(): Kernel.EventHandlerSpec[] {
        return []
    }
}

```
Then, register the module in your application's container builder:
```ts
// myproject/src/application/dependencyInjection/containerBuilder.ts

import { MyFeatureContainerModule } from '~/features/myfeature'

export class ContainerBuilder extends Kernel.AbstractContainerBuilder<Container> {

    getModules(): ContainerModule<any> {
        return [ new MyFeatureContainerModule() ]
    }

}
```