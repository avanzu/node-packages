import { GeneratorContext, GeneratorArguments } from '../../common/context'
import { Template } from '../../common/template'

export class TSConfig implements Template {
    target: string = ''
    directory: string = './'
    filename: string = 'tsconfig.json'
    async render(context: GeneratorContext<GeneratorArguments>): Promise<string> {
        let json = {
            compilerOptions: {
                allowJs: true,
                allowSyntheticDefaultImports: true,
                declaration: true,
                downlevelIteration: true,
                esModuleInterop: true,
                forceConsistentCasingInFileNames: true,
                noImplicitAny: false,
                noImplicitThis: false,
                outDir: './dist',
                skipLibCheck: true,
                sourceMap: true,
                strict: true,
                types: ['node', 'jest'],
                resolveJsonModule: true,
                noEmit: true,
                module: 'NodeNext',
                target: 'ES2020',
                incremental: true,
                tsBuildInfoFile: './dist/incremental.tsbuildinfo',
                experimentalDecorators: true,
                emitDecoratorMetadata: true,
                strictNullChecks: true,

                paths: {
                    '~tests/*': ['./__tests__/*'],
                    '~/*': ['./src/*'],
                },
            },
            exclude: ['node_modules'],
            include: ['src', '__tests__'],
        }

        return JSON.stringify(json, null, 2)
    }
}
