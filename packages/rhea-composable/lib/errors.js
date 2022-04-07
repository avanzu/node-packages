const undeliverable = (description) =>
    Object.assign(new Error(description), {
        props: { undeliverable_here: true },
    })

const processFault = (description) =>
    Object.assign(new Error(description), {
        props: { condition: 'processing:failed', description },
    })

module.exports = { undeliverable, processFault }
