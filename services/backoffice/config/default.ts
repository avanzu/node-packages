import { deferConfig } from 'config/defer'
import { type Options as AJVOpts } from 'ajv'
import type { AuthenticatorOptions } from '@avanzu/kernel'
import mikroOrm from './mikro-orm'
import { Resources } from '../src/application/interfaces'

export default {
    host: deferConfig(() => process.env.HOST || 'localhost'),
    port: deferConfig(() => process.env.PORT || 9090),
    namespace: deferConfig(() => process.env.NAMESPACE || 'backoffice'),
    logger: deferConfig(() => ({
        level: 'debug',
    })),
    redis: deferConfig(() => ({
        connectionName: process.env.REDIS_HOST || 'foundation-cache',
        port: 6379,
        host: '127.0.0.1',
        username: 'default',
        password: '',
        db: 0,
        lazyConnect: true,
    })),
    validation: deferConfig(() : AJVOpts  => ({
        allErrors: true,
        strict: false,
        useDefaults: true,
        allowUnionTypes: true
    })),
    authentication: deferConfig(() : AuthenticatorOptions => ({
        secret: process.env.JWT_SECRET || 'ya3mdsDb4jHvTymEV9rfWQG5zhJVNheZ',
        jwt: {
            algorithm: 'HS512',
            issuer: process.env.JWT_ISSUER || 'avanzu_auth',
            expiresIn: process.env.JWT_EXPIY || '1d',
        }
    })),
    orm: deferConfig(() => mikroOrm),
    resources: deferConfig(() : Resources => ({
        authorization: {
            baseURL: process.env.AUTH_BASE_URL,
        }
    }))
}
