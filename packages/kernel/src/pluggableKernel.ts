import { Kernel } from './kernel'
import * as Types from './interfaces'
import { PluginHookContext, PluginManager } from './modules'

export abstract class PluggableKernel<
    Config extends Types.Configuration,
    App extends Types.App<any, any, any>,
    Container extends Types.Container,
> extends Kernel<Config, App, Container> {
    protected plugins: PluginManager

    public async boot(): Promise<void> {
        await super.boot()
        this.plugins = this.container.build(PluginManager)
        await this.plugins.initialize()

        await this.plugins.invoke(new PluginHookContext('kernel.boot', this, {}))

    }

    public async shutdown(): Promise<void> {

        await this.plugins.invoke(new PluginHookContext('kernel.shutdown', this, {}))

        await this.plugins.dispose()
        await super.shutdown()
    }
}
