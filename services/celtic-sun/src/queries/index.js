const { useDialog } = require('@avanzu/rhea-composable')

module.exports = (connection) => {
    const queries = new Map()

    const { openDialog } = useDialog(connection)

    queries.set('lost-fox.ping', openDialog('lost-fox/ping/find'))

    const queryOf = (name) =>
        new Promise((resolve, reject) =>
            queries.has(name)
                ? resolve(queries.get(name))
                : reject(new Error(`Query ${name} not found`))
        )

    return { queryOf }
}
