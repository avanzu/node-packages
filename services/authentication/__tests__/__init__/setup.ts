import { GenericContainer } from 'testcontainers'
const setup = async () => {

    console.log('Starting redis instance')

    const container = await new GenericContainer('redis')
        .withExposedPorts(6379)
        .start()

    process.env.REDIS_URL = `redis://${container.getHost()}:${container.getMappedPort(6379)}`

    process.env.__REDIS_HOST__ = container.getHost()
    process.env.__REDIS_PORT__ = String(container.getMappedPort(6379))
    process.env.REDIS_HOST = container.getHost()
    process.env.REDIS_PORT = String(container.getMappedPort(6379))

    console.log('Redis instance running on %s', process.env.REDIS_URL)
}


export default setup