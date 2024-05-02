import { GeneratorContext, GeneratorArguments } from '../../common/context'
import { Template } from '../../common/template'

export class TSConfigBuild implements Template {
    target: string = ''
    directory: string = './'
    filename: string = 'tsconfig.build.json'
    async render(context: GeneratorContext<GeneratorArguments>): Promise<string> {
        let json = {
            extends: './tsconfig.json',
            compilerOptions: {
                outDir: './dist',
                rootDir: './src',
                noEmit: false,
            },
            include: ['src'],
        }

        return JSON.stringify(json, null, 2)
    }
}
