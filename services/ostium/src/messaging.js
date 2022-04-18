const { useConnection } = require('@avanzu/rhea-composable')
module.exports = (app) => {
    const { connectionOf } = useConnection()
    app.set('rheaConnection', connectionOf(app.get('host'), app.get('amqp')))
}
