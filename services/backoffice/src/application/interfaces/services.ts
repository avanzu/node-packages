import { AppServices, Authorization } from "@avanzu/kernel"
import type Ajv from "ajv"
import type { CacheDriver, CurrentUser, Feature } from "~/domain/interfaces"
import type { ORMProvider } from "../dependencyInjection/orm"
import type { AppService } from "../services/appService"
import type { Config } from "./application"

export type Services = AppServices & {
    appService: AppService
    appConfig: Config
    appCache: Cache
    cacheDriver: CacheDriver
    useCases: Feature[]
    ajv: Ajv
    ORMProvider: ORMProvider
    authorization: Authorization

}