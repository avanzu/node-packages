/// <reference types="awilix-manager" />

import { ContainerBuilder } from '@avanzu/kernel'
import { aliasTo, asClass, asValue } from 'awilix'

import '~/application/controllers'
import '~/application/resolvers'
import '~/domain'
import '~/presentation'

import { Cache, NoCacheDriver } from '~/domain/services/cache'
import { Dispatcher } from '~/domain/services/dispatcher'
import { CurrentUserAdapter } from '../adapters/CurrentUser'
import { Config, Container } from '../interfaces'
import { AppService } from '../services/appService'

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
        container.register('dispatcher', asClass(Dispatcher))
        container.register('currentUser', asClass(CurrentUserAdapter))
        container.register('cache', aliasTo('appCache'))

        // for (let useCase of getUseCases()) {
        //     container.register(
        //         useCase.containerId,
        //         asClass(useCase.useCase, { tags: useCase.tags })
        //     )
        // }


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
