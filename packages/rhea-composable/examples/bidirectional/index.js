const setup = require('../../__tests__/__init__/setup')
const teardown = require('../../__tests__/__init__/teardown')
const { useConnection } = require('../..')

const debug = require('debug')('example/bidirectinal')

const startResponding = require('./responder')
const startRequesting = require('./requestor')
const terminate = () => new Promise((Ok) => setTimeout(Ok, 10000))

const closeConnection = () => {
    const { connectionOf, closeConnection } = useConnection()
    closeConnection(connectionOf('my-connection-id'))
}

const exitOk = () => process.exit(0)
const exitErr = (err) => (console.error(err), process.exit(1))

Promise.resolve(debug('Bidirectional message processing example...'))
    .then(() => debug('Setting up'))
    .then(setup)
    .then(() => debug('Starting to request'))
    .then(startRequesting)
    .then(() => debug('Starting to respond'))
    .then(startResponding)
    .then(() => debug('terminating in 10 seconds'))
    .then(terminate)
    .then(() => debug('closing connection'))
    .then(closeConnection)
    .then(() => debug('tearing down broker'))
    .then(teardown)
    .then(() => debug('terminating program.'))
    .then(exitOk, exitErr)
