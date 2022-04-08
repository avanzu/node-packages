const panic = (error) => {
    throw error
}

const undeliverable = (description) =>
    Object.assign(new Error(description), {
        props: { undeliverable_here: true },
        conclude: (delivery) =>
            delivery.release({
                undeliverable_here: true,
            }),
    })

const processFault = (reason) =>
    Object.assign(new Error(`${reason}`), {
        props: { condition: 'processing:failed', description: `${reason}` },
        conclude: (delivery) =>
            delivery.reject({
                condition: 'processing:failed',
                description: `${reason}`,
            }),
    })

const noSuchRequest = (key) =>
    Object.assign(new Error(`Request [${key}] not found`), {
        props: { condition: 'request:notfound', description: `Request [${key}] not found` },
        conclude: (delivery) =>
            delivery.reject({
                condition: 'request:notfound',
                description: `Request [${key}] not found`,
            }),
    })

module.exports = { panic, undeliverable, processFault, noSuchRequest }
