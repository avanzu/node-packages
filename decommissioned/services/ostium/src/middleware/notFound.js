const notFound = require('@feathersjs/express').notFound()
module.exports = (app) => {
    app.use((req, res, next) => {
        Object.keys(app.services).some((service) => req.url.startsWith(`/${service}`))
            ? next()
            : notFound(req, res, next)
    })
}
