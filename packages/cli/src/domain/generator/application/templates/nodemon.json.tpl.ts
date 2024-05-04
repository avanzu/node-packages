import { GeneratorContext, GeneratorArguments } from '../../common/context'
import { Template } from '../../common/template'

export class NodemonJSON implements Template {
    directory: string = './'
    filename: string = 'nodemon.json'
    async render(context: GeneratorContext<GeneratorArguments>): Promise<string> {
        let contents = {
            watch: ['src', 'config'],
            ext: 'js,json,ts',
            exec: 'node -r ts-node/register -r tsconfig-paths/register',
            ignore: ['coverage/', 'dist/', '__tests/'],
        }
        return JSON.stringify(contents, null, 2)
    }
}
