import type { PluginDefinition } from "./plugin";

export interface PluginRepository {
    getPluginsEnabled() : Promise<PluginDefinition[]>
    getPluginsAvailable() : Promise<PluginDefinition[]>
}