const { useConnection } = require('@avanzu/rhea-composable')
const { useRedis } = require('@avanzu/redis-composable')
const configureProcessing = require('./processing')
const startAdvertising = require('./advertising')
const useCatalog = require('./catalog')
const startProcessing = require('./processor')

module.exports = ({ amqp, redis }) => {
    const rheaLink = useConnection().connectionOf('lost-fox', amqp)
    const redisLink = useRedis().connectionOf('celtic-sun', { url: redis })
    const catalog = useCatalog()
    configureProcessing(catalog)

    startProcessing(catalog, rheaLink)
    startAdvertising(catalog, redisLink)
}
