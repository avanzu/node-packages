import { AppServices, Logger } from '@avanzu/kernel'
import type Ajv from 'ajv'
import type { CacheDriver, CurrentUser, Feature } from '~/domain/interfaces'
import type { ORMProvider } from '../dependencyInjection'
import type { AppService } from '../services'
import type { Config } from './application'

export type Services = AppServices & {
    appLogger: Logger
    appService: AppService
    appConfig: Config
    appCache: Cache
    cacheDriver: CacheDriver
    useCases: Feature[]
    currentUser: CurrentUser
    ajv: Ajv
    ORMProvider: ORMProvider
}
