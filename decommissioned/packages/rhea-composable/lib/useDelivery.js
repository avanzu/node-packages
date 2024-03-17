const { debug } = require('./inspect')('useDelivery')

module.exports = (delivery) => {
    const allDone = () => {
        debug('Settling delivery [%s]', delivery.id)
        delivery.update(true)
    }

    const noLuck = (error) => {
        debug('Concluding delivery [%s] using error %o', delivery.id, error)
        error.conclude && error.conclude(delivery)
    }

    return { allDone, noLuck, settle: allDone }
}
