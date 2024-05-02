import { GeneratorContext, GeneratorArguments } from "../../common/context";
import { Template } from "../../common/template";

export class AppService implements Template {
    directory: string = './src/application/services';
    filename: string = 'appService.ts';
    async render(context: GeneratorContext<GeneratorArguments>): Promise<string> {
        return `
            import { LogAsync } from '@avanzu/decorators'
            import { readFile } from 'fs/promises'

            export type AppInfo = {
                name: string
                version: string
                description: string
                author: string
            }

            export class AppService {
                protected appInfo?: AppInfo

                @LogAsync()
                protected async buildInfo() {
                    let raw = await readFile(\`${__dirname}/../../../package.json\`, 'utf-8')
                    let contents = JSON.parse(raw)
                    let appInfo = {
                        name: contents.name,
                        version: contents.version,
                        description: contents.description,
                        author: contents.author,
                    }
                    this.appInfo = appInfo
                }

                async info() {
                    if (false === Boolean(this.appInfo)) {
                        await this.buildInfo()
                    }

                    return this.appInfo
                }
            }

        `
    }

}