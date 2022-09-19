const { MongoDBContainer, GenericContainer } = require('testcontainers')
const state = require('./state')

// eslint-disable-next-line no-unused-vars
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
const openMongoDB = () =>
    new MongoDBContainer().start().then((mongodb) => {
        state.store('mongodb', mongodb)
        console.log(mongodb.getHost())
        process.env.__MONGO_HOST__ = mongodb.getHost()
        process.env.__MONGO_PORT__ = mongodb.getMappedPort(27017)
    })

const setup = () => Promise.all([openMongoDB()])

module.exports = setup
