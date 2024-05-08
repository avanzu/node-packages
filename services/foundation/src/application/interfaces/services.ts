import type { CacheDriver } from "~/domain/interfaces"
import type { AppService } from "../services/appService"
import type { Config } from "./application"

export type Services = {
    appService: AppService
    appConfig: Config
    appCache: Cache
    cacheDriver: CacheDriver
}