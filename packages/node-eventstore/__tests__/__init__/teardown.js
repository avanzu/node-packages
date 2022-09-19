const state = require('./state')

const closeMongoDB = () => state.lookup('mongodb').stop()
// eslint-disable-next-line no-unused-vars
const closeRedis = () => state.lookup('redis').stop()

const teardown = () => Promise.all([closeMongoDB()])

module.exports = teardown
