import { GeneralError } from '@avanzu/kernel'
import { MikroORM, type EntityManager } from '@mikro-orm/core'
import { defineConfig, type Options as MongoORM } from '@mikro-orm/mongodb'

export class ORMProvider {

    protected orm?: MikroORM

    constructor(protected options: MongoORM) {}

    getORM(): MikroORM {
        if (null == this.orm) {
            throw new GeneralError('ORM not initialized')
        }
        return this.orm
    }

    entityManager(): EntityManager {
        return this.getORM().em
    }

    async init() {
        let options = defineConfig({ ...this.options })
        this.orm = await MikroORM.init(options)
    }

    async dispose() {
        await this.orm?.close()
    }
}
