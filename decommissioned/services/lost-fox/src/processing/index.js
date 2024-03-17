module.exports = (catalog) => {
    const { addEntry } = catalog

    addEntry('lost-fox/ping/find', {
        path: 'lost-fox/ping',
        channel: 'lost-fox/ping/find',
        action: 'find',
        dispatch: {
            default: () =>
                new Promise((resolve) => resolve({ body: { name: 'lost-fox', pong: new Date() } })),
        },
    })
}
