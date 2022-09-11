const setup = require('../../__tests__/__init__/setup')
const teardown = require('../../__tests__/__init__/teardown')
const debug = require('debug')('example/unidirectinal')

const { useConnection } = require('../..')

const startProcessing = require('./worker')
const startDispatching = require('./dispatcher')

const terminate = () => new Promise((Ok) => setTimeout(Ok, 10000))
const closeConnection = () => {
    const { connectionOf, closeConnection } = useConnection()
    closeConnection(connectionOf('my-connection-id'))
}

const exitOk = () => process.exit(0)
const exitErr = () => process.exit(1)

Promise.resolve(debug('Unidirectional message processing example...'))
    .then(() => debug('Setting up'))
    .then(setup)
    .then(() => debug('Starting to dispatch'))
    .then(startDispatching)
    .then(() => debug('Starting to process'))
    .then(startProcessing)
    .then(() => debug('terminating in 10 seconds'))
    .then(terminate)
    .then(() => debug('closing connection'))
    .then(closeConnection)
    .then(() => debug('tearing down broker'))
    .then(teardown)
    .then(() => debug('terminating program.'))
    .then(exitOk, exitErr)
