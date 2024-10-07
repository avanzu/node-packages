import { deferConfig } from 'config/defer'
import { type Options as AJVOpts } from 'ajv'
import type { AuthenticatorOptions, ResourceMap } from '@avanzu/kernel'
import type { Resources } from '../src/application/interfaces'
import type { Algorithm } from 'jsonwebtoken'
import mikroOrm from './mikro-orm'

export default {
    host: deferConfig(() => process.env.HOST || 'localhost'),
    port: deferConfig(() => process.env.PORT || 9090),
    namespace: deferConfig(() => process.env.NAMESPACE || null),
    publicRoot: deferConfig(() => `${__dirname}/../public` ),
    logger: deferConfig(() => ({
        level: process.env.LOG_LEVEL || 'debug',
    })),
    redis: deferConfig(() => ({
        connectionName: process.env.REDIS_CONNECTION_NAME || 'foundation-cache',
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST,
        username: process.env.REDIS_USER || 'default',
        password: process.env.REDIS_PASSWD || '',
        db: process.env.REDIS_DB || 0,
        lazyConnect: true,
    })),
    validation: deferConfig(
        (): AJVOpts => ({
            allErrors: true,
            strict: false,
            useDefaults: true,
            allowUnionTypes: true,
        })
    ),
    authentication: deferConfig(
        (): AuthenticatorOptions => ({
            secret: process.env.JWT_SECRET || 'ya3mdsDb4jHvTymEV9rfWQG5zhJVNheZ',
            jwt: {
                algorithm: (process.env.JWT_ALGO || 'HS512') as Algorithm,
                issuer: process.env.JWT_ISSUER || 'avanzu_auth',
                expiresIn: process.env.JWT_EXPIY || '1d',
            },
        })
    ),
    orm: deferConfig(() => mikroOrm),
    resources: deferConfig(
        (): Resources => ({
            authentication: {
                url: '',
                auth: true,
            },
        })
    ),
    pluginBaseDir: deferConfig(() => `${__dirname}/../dist/plugins`),
    plugins: [
        {
            type: 'local',
            modulePath: './localTest.js',
            className: 'LocalTestPlugin',
            options: {}
        }
    ]
}
