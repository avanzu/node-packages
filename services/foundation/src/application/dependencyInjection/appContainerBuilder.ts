/// <reference types="awilix-manager" />

import { ContainerBuilder, getUseCases } from '@avanzu/kernel'
import { aliasTo, asClass, asFunction, asValue } from 'awilix'
import '~/application/controllers'
import '~/domain'
import { Cache, NoCacheDriver } from '~/domain/services/cache'
import { Dispatcher } from '~/domain/services/dispatcher'
import { Config, Container } from '../interfaces'
import { AppService } from '../services/appService'
import { getWithTags } from 'awilix-manager'
import { CurrentUserAdapter } from '../adapters/CurrentUser'

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
