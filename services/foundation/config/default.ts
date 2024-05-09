import { deferConfig } from 'config/defer'

export default {
    host: deferConfig(() => process.env.HOST || 'localhost'),
    port: deferConfig(() => process.env.PORT || 9090),
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
}
