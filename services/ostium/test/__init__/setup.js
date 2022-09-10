const { GenericContainer } = require('testcontainers')
const state = require('./state')

const openActiveMq = () =>
    new GenericContainer('rmohr/activemq:latest')
        .withExposedPorts(61616, 8161, 5672)
        .start()
        .then((activemq) => {
            state.store('activemq', activemq)

            process.env.ACTIVEMQ_URL = `amqp10://admin@${activemq.getHost()}:${activemq.getMappedPort(
                5672
            )}`

            process.env.__ACTIVEMQ_HOST__ = activemq.getHost()
            process.env.__ACTIVEMQ_PORT__ = activemq.getMappedPort(5672)
        })

const openRedis = () =>
    new GenericContainer('redis')
        .withExposedPorts(6379)
        .start()
        .then((redis) => {
            state.store('redis', redis)
            process.env.REDIS_URL = `redis://${redis.getHost()}:${redis.getMappedPort(6379)}`
            process.env.__REDIS_HOST__ = redis.getHost()
            process.env.__REDIS_PORT__ = redis.getMappedPort(6379)
        })

const setup = () => Promise.all([openActiveMq(), openRedis()])

module.exports = setup
