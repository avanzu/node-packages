import { ContainerModule, interfaces } from 'inversify'
import { MongoClientFactory } from '../factories/mongoClient'
import { TYPES } from '../../common/types'

export const persistenceModule = new ContainerModule(async (bind: interfaces.Bind) => {
    bind<MongoClientFactory>(TYPES.Database).to(MongoClientFactory)
})
