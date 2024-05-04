import { LogAsync } from '@avanzu/decorators'
import { readFile } from 'fs/promises'
import { User } from '../interfaces'
import { Cache } from '~/domain/interfaces'

export type AppInfo = {
    name: string
    version: string
    description: string
    author: string
}

export class AppService {
    protected appInfo?: AppInfo

    constructor(protected cache: Cache) {}

    @LogAsync()
    protected async buildInfo() {
        let raw = await readFile(`${__dirname}/../../../package.json`, 'utf-8')
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
