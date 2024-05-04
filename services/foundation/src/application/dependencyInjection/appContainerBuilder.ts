/// <reference types="awilix-manager" />

import { ContainerBuilder } from '@avanzu/kernel'
import { asClass, asFunction } from 'awilix'
import { Config, Container } from '../interfaces'
import { AppService } from '../services/appService'
import '../controllers'
import { Redis } from 'ioredis'
import { RedisCache } from '~/infrastructure/redisCache'

export class AppContainerBuilder implements ContainerBuilder {
    protected options: Config

    constructor(options: Config) {
        this.options = options
    }

    public async build(container: Container): Promise<void> {
        container.register('appService', asClass(AppService, { lifetime: 'SINGLETON' }))
        container.register(
            'redisCacheClient',
            asFunction(() => new Redis(this.options.get('redis')), {
                lifetime: 'SINGLETON',
                asyncInit: 'connect',
                asyncDispose: 'quit',
            })
        )
        container.register('cache', asClass(RedisCache, { lifetime: 'SINGLETON' }))
    }
}
