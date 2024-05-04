import { Cache } from "~/domain/interfaces";
import type { Redis } from 'ioredis'
import { Packr } from "msgpackr";


export class RedisCache implements Cache {

    protected client: Redis
    protected packr: Packr

    constructor(redisCacheClient: Redis) {
        this.client = redisCacheClient
        this.packr = new Packr({ maxSharedStructures: 8160, structures: [] })
    }

    protected pack(contents: unknown) : Buffer {
        return this.packr.pack(contents)
    }
    protected unpack<T = unknown>(buffer: Buffer) : T {
        return this.packr.unpack(buffer)
    }

    async exists(key: string): Promise<boolean> {
        let result = await this.client.exists(key)
        return Boolean(result)
    }
    async drop(key: string): Promise<void> {
        await this.client.del(key)
    }
    async save(key: string, value: unknown, ttl?: number | undefined): Promise<void> {
        if(true === Boolean(ttl))
            await this.client.setex(key, ttl!, this.pack(value))
        else
            await this.client.set(key, this.pack(value))
    }

    async get<T = unknown>(key: string): Promise<T> {
        let buffer = await this.client.getBuffer(key)
        if( null === buffer) {
            throw new Error('CacheMissError')
        }
        return this.unpack<T>(buffer!)

    }

}