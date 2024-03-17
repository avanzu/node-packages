const { useConnection } = require('@avanzu/rhea-composable')
const { useRedis } = require('@avanzu/redis-composable')
const configureQueries = require('./queries')
const configureProcessing = require('./processing')
const startAdvertising = require('./advertising')

module.exports = ({ amqp, redis }) => {
    const rheaLink = useConnection().connectionOf('celtic-sun', amqp)
    const redisLink = useRedis().connectionOf('celtic-sun', { url: redis })
    const queries = configureQueries(rheaLink)

    configureProcessing(rheaLink, queries)
    startAdvertising(redisLink)
}
