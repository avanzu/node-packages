import { AppKernel } from './application/appKernel'
import config from 'config'

async function main() {
    let kernel = new AppKernel(config)

    process.on('SIGTERM', kernel.shutdown.bind(kernel))
    process.on('SIGINT', kernel.shutdown.bind(kernel))

    try {
        await kernel.boot()
    } catch (error) {
        console.error(error)
        process.exit(1)
    }

    try {
        await kernel.serve()
    } catch (error) {
        console.error(error)
        process.exit(2)
    }
}

main()
