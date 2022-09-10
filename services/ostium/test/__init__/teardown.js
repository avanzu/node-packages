const state = require('./state')

const closeActiveMq = () => state.lookup('activemq').stop()
const closeRedis = () => state.lookup('redis').stop()

const teardown = () => Promise.all([closeActiveMq(), closeRedis()])

module.exports = teardown
