const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication')
// const { expressOauth } = require('@feathersjs/authentication-oauth')
const { LocalThreadedStrategy } = require('./authentication/strategies/local')
module.exports = (app) => {
    const authentication = new AuthenticationService(app)

    authentication.register('jwt', new JWTStrategy())
    authentication.register('local', new LocalThreadedStrategy())

    app.use('/authentication', authentication)
    // app.configure(expressOauth())
}
