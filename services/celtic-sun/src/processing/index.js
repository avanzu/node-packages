const { useProcessor } = require('@avanzu/rhea-composable')
module.exports = (connection, queries) => {
    const { processMessages } = useProcessor(connection)
    const { queryOf } = queries
    processMessages('celtic-sun/ping/find', {
        default: () =>
            new Promise((resolve) => {
                queryOf('lost-fox.ping')
                    .then((query) => query.send({ body: 'celtic-sun' }))
                    .then((result) => ({ body: { name: 'celtic-sun', lostFox: result } }))
                    .then(resolve)
            }),
    })
}
