const events = require('./events')
module.exports = {
    ...events,
    useRedis: require('./useRedis'),
}
