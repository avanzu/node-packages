const state = require('./state')

const closeRedis = () => state.lookup('redis').stop()

const teardown = () => Promise.all([closeRedis()])

module.exports = teardown
