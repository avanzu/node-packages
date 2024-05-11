/// <reference types="awilix-manager" />

import { AJVValidator, ContainerBuilder, JWTAuthenticator } from '@avanzu/kernel'
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

export class AppContainerBuilder implements ContainerBuilder {
    protected options: Config

    constructor(options: Config) {
        this.options = options
    }

    public async build(container: Container): Promise<void> {
        container.register('appService', asClass(AppService, { lifetime: 'SINGLETON' }))
        container.register('ajv', this.ajvSingleton())
        container.register('ORMProvider', this.ormSingleton())
        container.register('authenticator', this.authenticatorSingleton())
        container.register('appConfig', asValue(this.options))
        container.register('appCache', asClass(Cache))
        container.register('cacheDriver', asClass(NoCacheDriver))
        container.register('cache', aliasTo('appCache'))
        container.register('validator', asClass(AJVValidator))
    }

    private authenticatorSingleton() {
        let resolver = asClass(JWTAuthenticator, { lifetime: 'SINGLETON' })
        return resolver.inject(() => ({ options: this.options.get('authentication') }))
    }

    private ormSingleton() {
        let resolver = asClass(ORMProvider, { asyncInit: 'init', asyncDispose: 'dispose', lifetime: 'SINGLETON' })
        return resolver.inject(() => ({ options: this.options.get('orm') }))
    }

    private ajvSingleton() {
        let resolver = asClass(Ajv, { lifetime: 'SINGLETON' })
        return resolver.inject(() => ({ opts: this.options.get('validation') }))
    }
}
