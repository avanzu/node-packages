import { GeneratorContext, GeneratorArguments } from "../../common/context";
import { Template } from "../../common/template";

export class JestConfig implements Template {
    directory: string = './';
    filename: string = 'jest.config.ts';
    async render(context: GeneratorContext<GeneratorArguments>): Promise<string> {
        let contents = `
        import { pathsToModuleNameMapper } from 'ts-jest'
        import { compilerOptions } from './tsconfig.json'
        import type { JestConfigWithTsJest } from 'ts-jest'

        const jestConfig: JestConfigWithTsJest = {
            roots: ['<rootDir>'],
            moduleNameMapper: pathsToModuleNameMapper(
                compilerOptions.paths , { prefix: '<rootDir>/' }
            ),
            setupFilesAfterEnv: ['trace-unhandled/register'],
            preset: 'ts-jest',
            transform: {
                '^.+\\.tsx?$': ['ts-jest', { extends: './tsconfig.json' }],
            },
        }

        export default jestConfig
        `

        return contents
    }

}