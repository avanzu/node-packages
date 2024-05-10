import type { CacheDriver } from "~/domain/interfaces"
import type { AppService } from "../services/appService"
import type { Config } from "./application"
import type { Dispatcher } from "~/domain/services/dispatcher"
import type { Feature, CurrentUser } from "~/domain/interfaces"
import { AppServices } from "@avanzu/kernel"

export type Services = AppServices & {
    appService: AppService
    appConfig: Config
    appCache: Cache
    cacheDriver: CacheDriver
    dispatcher: Dispatcher
    useCases: Feature[]
    currentUser: CurrentUser
}