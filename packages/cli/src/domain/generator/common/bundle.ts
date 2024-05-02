import { GeneratorArguments, GeneratorContext } from './context'
import { Template } from './template'
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

export class Bundle<Args extends GeneratorArguments> {
    bundleName: string = ''

    constructor(protected args: Args) {}

    createContext(): GeneratorContext<Args> {
        return {
            ...this.args,
        }
    }

    async generate(): Promise<void> {
        let context = this.createContext()
        await this.makeDirs(context)
        await this.makeFiles(context)
    }

    protected getTemplates(): Template[] {
        return []
    }

    protected async makeFiles(context: GeneratorContext<Args>): Promise<void> {
        for (let template of this.getTemplates()) {
            let contents = await template.render(context)
            let filePath = path.join(context.cwd, template.directory, template.filename)
            await writeFile(filePath, contents, 'utf-8')
        }
    }

    protected async makeDirs(context: GeneratorContext<Args>): Promise<void> {
        let sorted = this.getTemplates().sort(this.sortByDepth())
        let cwd = path.normalize(path.join(context.cwd, './'))
        let dirs = new Set<string>([cwd])

        for (let template of sorted) {
            let dirname = path.normalize(path.join(cwd, template.directory))
            if (dirs.has(dirname)) continue
            await mkdir(dirname)
            dirs.add(dirname)
        }
    }

    private sortByDepth(): (a: Template, b: Template) => number {
        return (a, b) => {
            return (
                a.directory.split('/').filter(Boolean).length -
                b.directory.split('/').filter(Boolean).length
            )
        }
    }
}
