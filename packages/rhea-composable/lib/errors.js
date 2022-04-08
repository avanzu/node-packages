const panic = (error) => {
    throw error
}

const releasable = (target, props) =>
    Object.assign(target, { props, conclude: (delivery) => delivery.release(props) })

const rejectable = (target, props) =>
    Object.assign(target, { props, conclude: (delivery) => delivery.reject(props) })

const undeliverable = (description) =>
    releasable(new Error(description), {
        undeliverable_here: true,
    })

const processFault = (reason) =>
    rejectable(new Error(`${reason}`), {
        condition: 'processing:failed',
        description: `${reason}`,
    })

const noSuchRequest = (key) =>
    releasable(new Error(`Request [${key}] not found`), {
        delivery_failed: true,
    })

const requestTimedOut = (key) =>
    releasable(new Error(`Request [${key}] timed out`), {
        condition: 'request:timeout',
        description: `Request [${key}] timed out`,
    })

module.exports = { panic, undeliverable, processFault, noSuchRequest, requestTimedOut }
