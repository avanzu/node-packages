const { useProcessor } = require('@avanzu/rhea-composable')
module.exports = (connection) => {
    const { processMessages } = useProcessor(connection)

    processMessages('celtic-sun/ping/find', {
        default: () =>
            new Promise((resolve) => resolve({ body: { name: 'celtic-sun', pong: new Date() } })),
    })
}
