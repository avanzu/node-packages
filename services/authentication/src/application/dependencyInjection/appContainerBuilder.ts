/// <reference types="awilix-manager" />

import { ContainerBuilder, AJVValidator } from '@avanzu/kernel'
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
import { MikroORM, defineConfig } from '@mikro-orm/mongodb'
import { ORMProvider } from './orm'
import { UserRepository } from '~/domain/entities/userRepository'
import { Authenticator } from '~/domain/services'

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
        container.register(
            'ajv',
            asClass(Ajv, { lifetime: 'SINGLETON' }).inject(() => ({
                opts: this.options.get('validation'),
            }))
        )
        container.register('validator', asClass(AJVValidator))
        container.register(
            'ORMProvider',
            asClass(ORMProvider, {
                asyncInit: 'init',
                asyncDispose: 'dispose',
                lifetime: 'SINGLETON',
            }).inject(() => ({ options: this.options.get('orm') }))
        )
        container.register('users', asClass(UserRepository, { lifetime: 'TRANSIENT' }))
        container.register(
            'authenticator',
            asClass(Authenticator, { lifetime: 'SINGLETON' }).inject(() => ({
                options: this.options.get('authenticator'),
            }))
        )
    }
}
