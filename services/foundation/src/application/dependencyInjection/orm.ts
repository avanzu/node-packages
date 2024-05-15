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
        await this.orm.schema.ensureDatabase()
        await this.orm.schema.ensureIndexes()
        if(true === await this.orm.migrator.checkMigrationNeeded()) {
            await this.orm.migrator.up()
        }
    }

    async dispose() {
        await this.orm?.close()
    }
}
