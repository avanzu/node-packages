const { useRedis } = require('@avanzu/redis-composable')
const useAdvertisement = require('./advertisement')

module.exports = (app) => {
    const redis = useRedis().connectionOf('discovery', { url: app.get('redis') })

    useAdvertisement({ app, connection: app.get('rheaConnection') })

    const subscriber = redis.duplicate()
    const onServiceAvailable = (message) => {
        console.log(message)
        const { actions, ...service } = JSON.parse(message)
        actions.forEach((action) => app.emit('ServiceUp', { ...service, action }))
    }
    subscriber.connect().then(() => {
        redis.publish('gateway-available')
        redis.subscribe('service-available', onServiceAvailable)
    })
}
