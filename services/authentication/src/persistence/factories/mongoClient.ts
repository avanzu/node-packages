import { MongoClient } from 'mongodb'
import { DatabaseConnectorFactory } from '~/common/interfaces'
import {injectable, inject} from 'inversify'
import { TYPES } from '~/common/types'
import { Config } from '~/common/configuration'

@injectable()
export class MongoClientFactory implements DatabaseConnectorFactory<MongoClient> {
    constructor(@inject(TYPES.Config) protected config: Config) {}
    async create(tenantId: string) : Promise<MongoClient> {
        const opts = this.config.get('mongodb')

        const url = new URL(`mongodb://${opts.host}/`)
        url.username = opts.user
        url.password = opts.password
        url.pathname = tenantId
        for(const [key, value] of Object.entries(opts.options)) {
            url.searchParams.append(key, String(value))
        }


        const connectionString: string = url.toString()

        console.log(connectionString)

        return await MongoClient.connect(connectionString)

    }
}