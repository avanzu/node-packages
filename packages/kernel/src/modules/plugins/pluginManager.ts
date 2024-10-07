import { PluginHookContext } from './HookContext'
import * as Errors from './errors'
import { PluginInvocationError } from './errors'
import { isDisposable, type Plugin } from './plugin'
import { PluginRegistry } from './pluginRegistry'

export class PluginManager {
    protected plugins: Map<string, Plugin> = new Map()

    constructor(protected pluginRegistry: PluginRegistry) {}


    async initialize() : Promise<void> {
        const plugins = await this.pluginRegistry.loadPluginsEnabled()
        this.register(...plugins)
    }

    async dispose() : Promise<void> {
        for(let [, plugin] of this.plugins) {
          if(isDisposable(plugin)) await plugin.dispose()
        }

        this.plugins.clear()
    }

    register(...plugins: Plugin[]) {
        plugins = this.sort(plugins)

        for (let plugin of plugins) {
            if (this.plugins.has(plugin.name())) {
                throw new Errors.PluginAlreadyRegistered(plugin)
            }

            this.plugins.set(plugin.name(), plugin)
        }
    }

    async invoke(context: PluginHookContext): Promise<PluginHookContext> {
        for (let [name, plugin] of this.plugins) {
            try {
                context = await plugin.invoke(context)
            } catch (error) {
                throw new PluginInvocationError(plugin, error)
            }
        }

        return context
    }

    protected sort(plugins: Plugin[]) {
        const visited: Map<string, boolean> = new Map()
        const stack: Plugin[] = []
        const visiting: Set<string> = new Set()
        const pool: Map<string, Plugin> = new Map(plugins.map((plugin) => [plugin.name(), plugin]))

        function visit(plugin: Plugin) {
            if (visiting.has(plugin.name())) {
                throw new Errors.CircularDependency(plugin, Array.from(visiting).concat(plugin.name()))
            }

            if (true === visited.get(plugin.name())) {
                return
            }

            visiting.add(plugin.name())
            for (const dependency of plugin.dependsOn()) {
                if (false === pool.has(dependency)) {
                    throw new Errors.MissingDependency(plugin, dependency)
                }
                visit(pool.get(dependency))
            }
            visiting.delete(plugin.name())
            visited.set(plugin.name(), true)
            stack.push(plugin)
        }

        for (const plugin of plugins) {
            if (visited.get(plugin.name())) {
                continue
            }
            visit(plugin)
        }

        return stack.reverse()
    }
}
