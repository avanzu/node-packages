import { deferConfig } from 'config/defer'
import { type Options as AJVOpts } from 'ajv'
import { defineConfig, type Options as MongoORM } from '@mikro-orm/mongodb'
import type { AuthenticatorOptions } from '../src/domain/services'

export default {
    host: deferConfig(() => process.env.HOST || 'localhost'),
    port: deferConfig(() => process.env.PORT || 9091),
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
    orm: deferConfig(() => defineConfig({
        clientUrl: process.env.MONGO_URL,
        dbName: 'authentication',
        password: process.env.MONGO_ROOT_PASSWD,
        user: process.env.MONGO_ROOT_USER,
        entities: ['./dist/domain/entities'],
        entitiesTs: ['./src/domain/entities'],
    })),
    authenticator: deferConfig(() : AuthenticatorOptions => ({
        secret: process.env.JWT_SECRET || 'ya3mdsDb4jHvTymEV9rfWQG5zhJVNheZ',
        jwt: {
            algorithm: 'HS512',
            issuer: process.env.JWT_ISSUER || 'avanzu_auth',
            expiresIn: process.env.JWT_EXPIY || '1d',
        }
    }))
}
