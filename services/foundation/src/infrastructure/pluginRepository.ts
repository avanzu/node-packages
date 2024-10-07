import { LogAsync } from "@avanzu/decorators";
import { PluginDefinition, PluginRepository } from "@avanzu/kernel";
import { Config } from "~/application/interfaces";

export class ConfigBasedPluginRepository implements PluginRepository {

    constructor(protected appConfig: Config) {}

    @LogAsync({ level: 'debug', enter: true, exit: true, enterPrefix: '[+]', exitPrefix: '[*]' })
    async getPluginsEnabled(): Promise<PluginDefinition[]> {
        return this.appConfig.get('plugins')
    }

    async getPluginsAvailable(): Promise<PluginDefinition[]> {
        return this.appConfig.get('plugins')
    }

}