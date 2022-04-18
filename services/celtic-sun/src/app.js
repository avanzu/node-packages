const { useConnection } = require('@avanzu/rhea-composable')
const { useRedis } = require('@avanzu/redis-composable')
const configureProcessing = require('./processing')
const startAdvertising = require('./advertising')

module.exports = ({ amqp, redis }) => {
    configureProcessing(useConnection().connectionOf('celtic-sun', amqp))
    startAdvertising(useRedis().connectionOf('celtic-sun', { url: redis }))
}
