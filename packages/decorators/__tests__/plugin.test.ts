import { ExecutionContext, Pluggable, Plugin, PluginAware, Plugins } from '~/index'

describe('Plugin system', () => {
    @PluginAware()
    class TestPluginAware {
        @Pluggable()
        async beExtended(arg: string): Promise<string> {
            return `${arg}-processed`
        }
    }

    @Plugin({ target: TestPluginAware })
    class TestPlugin {
        beforeBeExtended(context: ExecutionContext<[string], string>): ExecutionContext<[string], string> {
            let { params } = context
            params[0] = `${params[0]}(extended)`
            return context
        }

        afterBeExtended(context: ExecutionContext<[string], string>) {
            context.result = `${context.result}(extended)`
        }
    }

    Plugins.register(TestPluginAware, new TestPlugin())

    test('stuff', async () => {
        const thing = new TestPluginAware()

        let result = await thing.beExtended('base')
        expect(result).toEqual('base(extended)-processed(extended)')
    })
})
