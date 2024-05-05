import { GeneratorContext, GeneratorArguments } from '../../common/context'
import { Template } from '../../common/template'

export type DefaultConfigArguments = GeneratorArguments & {
    port: number
    host?: string
    logLevel?: string
}

export class DefaultConfig implements Template {
    directory: string = './config'
    filename: string = 'default.ts'
    async render(context: GeneratorContext<DefaultConfigArguments>): Promise<string> {
        return `

        import { deferConfig } from 'config/defer'

        export default {
            host: deferConfig(() => process.env.HOST || '${context.host || 'localhost' }'),
            port: deferConfig(() => process.env.PORT || ${context.port}),
            logger: {
                level: 'debug'
            }
        }

        `
    }
}
