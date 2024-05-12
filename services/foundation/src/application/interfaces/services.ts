import type { CacheDriver } from "~/domain/interfaces"
import type { AppService } from "../services/appService"
import type { Config } from "./application"
import type { Feature, CurrentUser } from "~/domain/interfaces"
import { AppServices } from "@avanzu/kernel"
import type Ajv from "ajv"
import type { ORMProvider } from "../dependencyInjection/orm"

export type Services = AppServices & {
    appService: AppService
    appConfig: Config
    appCache: Cache
    cacheDriver: CacheDriver
    useCases: Feature[]
    currentUser: CurrentUser
    ajv: Ajv
    ORMProvider: ORMProvider

}