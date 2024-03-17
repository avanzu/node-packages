module.exports = (redis) => {
    const advertise = () => {
        const message = {
            path: 'celtic-sun/ping',
            channel: 'celtic-sun/ping/find',
            actions: ['find'],
        }
        redis.publish('service-available', JSON.stringify(message))
    }

    const subscriber = redis.duplicate()
    subscriber.connect().then(() => {
        advertise()
        subscriber.subscribe('gateway-available', advertise)
    })
}
