import * as Path from 'node:path'
import type { Validator } from '~/interfaces'
import { isInitializable, type Plugin, type PluginDefinition } from './plugin'
import type { PluginRepository } from './pluginRepository'
import { RemotePlugin } from './RemotePlugin'

export class PluginRegistry {
    protected baseDir: string

    constructor(
        protected pluginRepository: PluginRepository,
        protected validator: Validator,
        baseDir?: string
    ) {
        if (false === Boolean(baseDir)) {
            baseDir = Path.resolve(process.cwd(), 'plugins')
        }

        this.baseDir = baseDir
    }

    async loadPluginsEnabled(): Promise<Plugin[]> {
        const enabledPlugins = await this.pluginRepository.getPluginsEnabled()
        return this.loadPlugins(enabledPlugins)
    }

    /**
     * Load plugins from various sources
     */
    protected async loadPlugins(pluginDefinitions: PluginDefinition[]): Promise<Plugin[]> {
        const plugins: Plugin[] = []
        for (const definition of pluginDefinitions) {
            const plugin = await this.create(definition)
            if (isInitializable(plugin)) await plugin.initialize()
            plugins.push(plugin)
        }
        return plugins
    }

    protected resolveModulePath(definition: PluginDefinition): string {
        if (definition.type === 'local') return Path.resolve(this.baseDir, definition.modulePath)
        if (definition.type === 'package') return definition.packageName
    }

    /**
     * Instantiate plugin using the provided definition.
     * This could dynamically import a module, or use a known plugin class.
     */
    protected async create(definition: PluginDefinition): Promise<Plugin> {
        if (definition.type === 'remote') return new RemotePlugin(definition, this.validator)

        const modulePath = this.resolveModulePath(definition) // Path to the plugin module (e.g., './plugins/myPlugin')
        const className = definition.className // Name of the exported plugin class (e.g., 'MyPlugin')

        // Dynamically import the module
        const module = await import(modulePath)

        if (!module[className]) {
            throw new Error(`Class ${className} not found in module ${modulePath}`)
        }

        // Instantiate the plugin class
        const PluginClass = module[className]

        // You can also pass configuration or context into the constructor if needed
        return new PluginClass(definition.config)
    }
}
