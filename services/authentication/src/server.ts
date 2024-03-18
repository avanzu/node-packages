import 'reflect-metadata'

import config from 'config'
import { Kernel } from './kernel'
(async () => {
    const kernel = new Kernel(config)
    try {
        await kernel.serve()
    } catch (error) {
        console.error('Server crashed', error)
        process.exit(1)
    }
})()
