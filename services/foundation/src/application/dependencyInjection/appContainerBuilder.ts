/// <reference types="awilix-manager" />

import * as Kernel from '@avanzu/kernel'
import { aliasTo, asClass, asValue } from 'awilix'

import '~/application/controllers'
import '~/application/resolvers'
import '~/domain'
import '~/presentation'

import Ajv from 'ajv'
import { Cache, NoCacheDriver } from '~/domain/services/cache'
import { Config, Container } from '../interfaces'
import { AppService } from '../services/appService'
import { ORMProvider } from './orm'

export class AppContainerBuilder implements Kernel.ContainerBuilder<Container> {
    protected logger: Kernel.Logger
    protected options: Config

    constructor(options: Config, logger: Kernel.Logger) {
        this.options = options
        this.logger = logger
    }

    public async build(container: Container): Promise<void> {
        container.register('appService', asClass(AppService, { lifetime: 'SINGLETON' }))
        container.register('appLogger', asValue(this.logger))
        container.register('ajv', this.ajvSingleton())
        container.register('ORMProvider', this.ormSingleton())
        container.register('authenticator', this.authenticatorSingleton())
        container.register('appConfig', asValue(this.options))
        container.register('appCache', asClass(Cache))
        container.register('cacheDriver', asClass(NoCacheDriver))
        container.register('cache', aliasTo('appCache'))
        container.register('validator', asClass(Kernel.AJVValidator))

        this.registerUseCases(container)
    }

    protected ajvSingleton() {
        const resolver = asClass(Ajv, { lifetime: 'SINGLETON' })
        return resolver.inject(() => ({ opts: this.options.get('validation') }))
    }

    protected authenticatorSingleton() {
        const resolver = asClass(Kernel.JWTAuthenticator, { lifetime: 'SINGLETON' })
        return resolver.inject(() => ({ options: this.options.get('authentication') }))
    }

    protected ormSingleton() {
        const resolver = asClass(ORMProvider, {
            asyncInit: 'init',
            asyncDispose: 'dispose',
            lifetime: 'SINGLETON',
        })
        return resolver.inject(() => ({ options: this.options.get('orm') }))
    }

    protected registerUseCases(container: Container) {
        for (const entry of Kernel.getUseCases()) {
            container.register(entry.id, asClass(entry.useCase))
        }
    }
}
