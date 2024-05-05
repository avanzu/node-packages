/// <reference types="awilix-manager" />

import { ContainerBuilder } from '@avanzu/kernel'
import { asClass, asValue } from 'awilix'
import '../controllers'
import { Config, Container } from '../interfaces'
import { AppService } from '../services/appService'
import { NoCacheDriver, Cache } from '~/domain/cache'

export class AppContainerBuilder implements ContainerBuilder {
    protected options: Config

    constructor(options: Config) {
        this.options = options
    }

    public async build(container: Container): Promise<void> {
        container.register('appService', asClass(AppService, { lifetime: 'SINGLETON' }))
        container.register('appConfig', asValue(this.options))
        container.register('appCache', asClass(Cache))
        container.register('cacheDriver', asClass(NoCacheDriver))

        // container.register(
        //     'redisCacheClient',
        //     asFunction(() => new Redis(this.options.get('redis')), {
        //         lifetime: 'SINGLETON',
        //         asyncInit: 'connect',
        //         asyncDispose: 'quit',
        //     })
        // )
    }
}
