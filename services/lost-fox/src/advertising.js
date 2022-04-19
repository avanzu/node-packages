module.exports = (catalog, redis) => {
    const { forAllEntries } = catalog
    const advertise = () => {
        forAllEntries((entry) => {
            const { path, channel, action } = entry
            const message = { path, channel, actions: [action] }
            redis.publish('service-available', JSON.stringify(message))
        })
    }

    const subscriber = redis.duplicate()
    subscriber.connect().then(() => {
        advertise()
        subscriber.subscribe('gateway-available', advertise)
    })
}
