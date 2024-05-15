export interface CacheDriver {
    exists(key: string): Promise<boolean>
    drop(key: string): Promise<void>
    save(key: string, value: unknown, ttl?: number): Promise<void>
    get<T = unknown>(key: string): Promise<T>
}
