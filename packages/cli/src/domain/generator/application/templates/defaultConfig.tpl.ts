import { GeneratorContext, GeneratorArguments } from '../../common/context'
import { Template } from '../../common/template'

export type DefaultConfigArguments = GeneratorArguments & {
    port: number
    host?: string
    logLevel?: string
}

export class DefaultConfig implements Template {
    directory: string = './config'
    filename: string = 'default.json'
    async render(context: GeneratorContext<DefaultConfigArguments>): Promise<string> {
        let contents = {
            host: context.host || 'localhost',
            port: context.port,
            logger: {
                level: context.logLevel || 'info',
            },
        }

        return JSON.stringify(contents, null, 2)
    }
}
