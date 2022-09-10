const { GenericContainer } = require('testcontainers')
const state = require('./state')

const openActiveMq = () =>
    new GenericContainer('rmohr/activemq:latest')
        .withExposedPorts(61616, 8161, 5672)
        .start()
        .then((activemq) => {
            state.store('activemq', activemq)
            console.log(activemq.getHost())
            process.env.__ACTIVEMQ_HOST__ = activemq.getHost()
            process.env.__ACTIVEMQ_PORT__ = activemq.getMappedPort(5672)
        })

const setup = () =>
    new Promise((Ok, Err) => {
        openActiveMq().then(Ok, Err)
    })

module.exports = setup
