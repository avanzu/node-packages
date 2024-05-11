/// <reference types="awilix-manager" />

import { ContainerBuilder, AJVValidator, JWTAuthenticator } from '@avanzu/kernel'
import { aliasTo, asClass, asValue } from 'awilix'

import '~/application/controllers'
import '~/application/resolvers'
import '~/domain'
import '~/presentation'

import { Cache, NoCacheDriver } from '~/domain/services/cache'
import { CurrentUserAdapter } from '../adapters/CurrentUser'
import { Config, Container } from '../interfaces'
import { AppService } from '../services/appService'
import Ajv from 'ajv'

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
        container.register('currentUser', asClass(CurrentUserAdapter))
        container.register('cache', aliasTo('appCache'))
        container.register('ajv', asClass(Ajv, { lifetime: 'SINGLETON'}).inject(() => ({ opts: this.options.get('validation') })))
        container.register('validator', asClass(AJVValidator))
        container.register('authenticator', asClass(JWTAuthenticator, { lifetime: 'SINGLETON' }).inject(() => ({options: this.options.get('authentication')})))
    }
}
