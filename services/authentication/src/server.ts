import { InversifyKoaServer } from 'inversify-koa-utils'
import 'reflect-metadata'
import { Config } from './common/configuration'
import { TYPES } from './common/types'
import { container } from './dependencyInjection/container'
import { errorHandler } from './errorHandler'

import config from 'config'
import { Kernel } from './kernel'

;(async () => {
    const kernel = new Kernel(config)
    try {
        await kernel.serve()
    } catch (error) {
        console.error('Server crashed', error)
        process.exit(1)
    }
})()

/*
(async () => {
    const server = new InversifyKoaServer(container)
    const config = container.get<Config>(TYPES.Config)
    try {
        await new Promise((Ok) => {
            server
                .setConfig((app) => app.use((ctx, next) => {
                    ctx.state.container = container
                    return next()
                }))
                .setErrorConfig((app) => app.use(errorHandler))
                .build()
                .listen(config.get('port'), config.get('host'), () => Ok(null))
        })
        console.log('Server started')
    } catch (error) {
        console.error('Server startup failed', error)
        process.exit(1)
    }
})()
*/
