import { Plugin, PluginHookContext } from "@avanzu/kernel";

export class LocalTestPlugin implements Plugin{

    constructor() {
        console.log('created LocalTestPlugin')
    }

    name(): string {
        return 'local-test'
    }
    version(): string {
        return '0.0.1'
    }
    dependsOn(): string[] {
        return []
    }
    description(): string {
        return 'local test plugin'
    }
    async invoke(context: PluginHookContext): Promise<PluginHookContext> {
        console.log('invoked test plugin %s', context.hook)
        return context
    }
}