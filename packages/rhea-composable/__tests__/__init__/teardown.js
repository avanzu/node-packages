const state = require('./state')

const closeActiveMq = () => state.lookup('activemq').stop()

const teardown = () =>
    new Promise((Ok, Err) => {
        closeActiveMq().then(Ok, Err)
    })

module.exports = teardown
