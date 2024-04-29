# `@avanzu/decorators`

> Decorators allowing to extend and alter behavior of methods


## Attach logging to class methods


```ts
import { Log, LogAsync } from '@avanzu/decorators'

class Example {

    @Log()
    public demo(myArg: number) : string {
        return `demo`
    }

    @LogAsync()
    public async demoAsync(myArg: number) : Promise<string> {
        return 'demo-async'
    }
}

```
During execution of the decorated methods, you will now have log entries

```
Example.demo() {
    time: 1714361138410,
    className: 'LogTest',
    methodName: 'demo',
    ms: 0
}

LogTest.demoAsync() {
    time: 1714361138410,
    className: 'LogTest',
    methodName: 'demo',
    ms: 0
}

```
### Decorator options
In order to customize the logging behavior, both decorators accept configuration options.


- `enter` _(boolean)_ - wether to generate a log entry before the actual method call.
    <br/>_Default:_ `false`
- `exit` _(boolean)_ - wether to generate a log entry after the method call.
    <br/>_Default:_ `true`
- `error` _(boolean)_ - wether to generate a log entry when an error occured during method execution.
    <br/>_Default:_ `true`
- `message` _(string)_ - the log message that should be used for the log entry.
    <br/>_Default:_ `${ClassName}.${MethodName}()`
- `args` _(boolean)_ - wether to include the method arguments in the log context.
    <br/>_Default:_ `false`
- `result` _(boolean)_ - wether to include the return value of the method call in the log context.
    <br/>_Default:_ `false`
- `enterPrefix` _(string)_ - string to prepend to the `enter` log message.
    <br/>_Default:_ `''`
- `errorPrefix` _(string)_ - string to prepend to the `exit` log message.
    <br/>_Default:_ `''`
- `exitPrefix` _(string)_ - string to prepent to the `error` log message.
    <br/>_Default:_ `''`
- `level` _(`'debug'|'info'|'warn'|'error'`)_ - the log level of `enter` and `exit` logs.
    <br/>_Default:_ `'info'`


### Global configuration
In order to to configure the logging behavior globally, you can use the same decorator options on the `LogBox`

```ts
import { LogBox } from '@avanzu/decorators'

LogBox.configure({
    // ...
 })

```
### Change the logger
You can change the logger from `console` to anything else that implements the `Logger` interface.

```ts
import { LogBox } from '@avanzu/decorators'
import { myLogger } from './logger'

LogBox.use(myLogger)
```
## Attach plguin capabilities to classes

Make your class `PluginAware`, decorate the methods as `Pluggable` that should allow plugins.
```ts
// ./src/pluginDemo.class.ts

import { PluginAware, Pluggable } from '@avanzu/decorators'

@PlguinAware()
class PluginDemo {

    @Pluggable()
    async doFoo(myArg: string) : Promise<string>{
        return `did foo with ${myArg}`
    }

    @Pluggable()
    async doBar(myArg: number): Promise<string>{
        return `didBar`
    }

}
```
Create your plugin(s)

```ts
// ./src/plugins/demo.plugin.ts

import { Plugin, ExecutionContext } from '@avanzu/decorators'
import { PluginDemo } from './pluginDemo.class'

type FooContext = ExecutionContext<[string], string>

@Plugin({ target: PluginDemo })
class DemoPlugin {

    async beforeDoFoo({ params }: FooContext) : Promise<void> {
        params.at(0) = params.at(0).concat('[extended before]')
    }

    async afterDoFoo(context: FooContext) : Promise<FooContext> {

        return {
            ...context,
            result: '[extended after]'.concat(context.result)
         }
    }

}
```

Register your plugin instance

```ts
// ./src/main.ts

import { Plugins } from '@avanzu/decorators'
import { PluginDemo } from './pluginDemo.class'
import { DemoPlugin } from './plugins/demo.plugin'

Plugins.register(PluginDemo, new DemoPlugin())

```

Execute your plugin aware method

```ts
// ./src/main.ts

const pluginDemo = new PluginDemo()

const result = await pluginDemo.doFoo('foo')

// -> [extended after] did foo with foo[extended before]

```

### Using symbols or strings
Instead of using class constructors to correlate a plugin with its corresponding class, you can also use symbols or strings.

Declare your key(s)
```ts
// ./src/types.ts

export const Types = {
    Demo: Symbol('pluginAware.demo'),
    // ...
}
```
Assing the key to your plugin aware class
```ts
// ./src/pluginDemo.class.ts

import { PluginAware, Pluggable } from '@avanzu/decorators'
import { Types } from './types'

@PlguinAware({ key: Types.Demo })
class PluginDemo {
    // ...
}
```
Assing the target to your plugin
```ts
// ./src/plugins/demo.plugin.ts

import { Plugin, ExecutionContext } from '@avanzu/decorators'
import { Types } from '../types'

// ...

@Plugin({ target: Types.Demo })
class DemoPlugin {
    //...
}
```
Register the plugin instance with the corresponding key
```ts
// ./src/main.ts

import { Plugins } from '@avanzu/decorators'
import { DemoPlugin } from './plugins/demo.plugin'
import { Types } from './types'

Plugins.register(Types.Demo, new DemoPlugin())

```

### Limitations

- Due to the implementation, `Pluggable` methods *should* be `async` (or return a `Promise`). Decorating a synchronous method *will* make it `async`.
- The order of execution is determined by the order of registration. If your plugins have dependencies on each other, you have to register them in the correct order yourself.

