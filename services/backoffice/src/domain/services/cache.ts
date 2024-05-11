import { CacheDriver } from "../interfaces/CacheDriver"

export class NoCacheDriver implements CacheDriver {
    async exists(key: string): Promise<boolean> {
        return false
    }
    async drop(key: string): Promise<void> {
    }
    async save(key: string, value: unknown, ttl?: number | undefined): Promise<void> {
    }

    async get<T = unknown>(key: string): Promise<T> {
        throw new Error("Method not implemented.")
    }

}

export class Cache {
    protected driver: CacheDriver
    constructor(cacheDriver?: CacheDriver) {

        if(null == cacheDriver) {
            cacheDriver = new NoCacheDriver()
        }
        this.driver = cacheDriver
    }

    async has(key: string): Promise<boolean> {
        return this.driver.exists(key)
    }

    async set(key: string, value: unknown, ttl?: number): Promise<void> {
        return this.driver.save(key, value, ttl)
    }

    async remove(key: string): Promise<void> {
        return this.driver.drop(key)
    }

    async get<T = unknown>(key: string): Promise<T> {
        return this.driver.get<T>(key)
    }
}

