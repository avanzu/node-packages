const serviceMethods = require('./serviceMethods')
const { useDialog } = require('@avanzu/rhea-composable')

module.exports = ({ app, connection }) => {
    const channels = new Map()

    const makeChannel = (topic) => {
        const { openDialog } = useDialog(connection)
        channels.set(topic, openDialog(topic))
    }

    const channelOf = (topic) => {
        channels.has(topic) || makeChannel(topic)
        return channels.get(topic)
    }
    const makeService = (path) => {
        const { methods } = serviceMethods()
        app.use(path, methods)
    }

    const serviceOf = (path) => {
        app.services[path] || makeService(path)
        return app.service(path)
    }

    const oneServiceUp = (event) => {
        const { path, channel, action } = event
        const { acceptAction } = serviceOf(path)

        const runAction = ({ id, data }) => channelOf(channel).send({ body: { id, data } })

        acceptAction(action, runAction)
    }

    const onServiceDown = (event) => {
        const { path, action } = event
        const { rejectAction } = serviceOf(path)
        rejectAction(action)
    }

    app.on('ServiceUp', oneServiceUp).on('ServiceDown', onServiceDown)
}
