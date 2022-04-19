const { useProcessor } = require('@avanzu/rhea-composable')
module.exports = (catalog, connection) => {
    const { processMessages } = useProcessor(connection)
    catalog.forAllEntries((entry) => {
        const { channel, dispatch } = entry
        processMessages(channel, dispatch)
    })
}
