const { GenericContainer } = require('testcontainers')
const state = require('./state')

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

const setup = () => Promise.all([openRedis()])

module.exports = setup
