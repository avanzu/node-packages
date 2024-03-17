import config, { IConfig } from 'config'
import { Container } from 'inversify'
import { Kernel } from '../kernel'
import { monitoringModule } from '../monitoring/dependencyInjection/module'
import { persistenceModule } from '../persistence/dependencyInjection/module'
import { multitenancyModule } from '../multitenancy/dependencyInjection/module'
import { TYPES } from '~/common/types'
import pino, { Logger } from 'pino'
export const container = new Container()

container.bind<IConfig>(TYPES.Config).toConstantValue(config)
container.bind<Logger>(TYPES.Logger).toConstantValue(pino())
container.bind<Kernel>(Kernel).toSelf()
container.load(monitoringModule, persistenceModule, multitenancyModule)
