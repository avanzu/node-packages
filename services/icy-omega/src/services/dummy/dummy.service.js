// Initializes the `dummy` service on path `/dummy`
const { Dummy } = require('./dummy.class')
const hooks = require('./dummy.hooks')

module.exports = function (app) {
    const options = {
        paginate: app.get('paginate'),
    }

    // Initialize our service with any options it requires
    app.use('/dummy', new Dummy(options, app), (req, res) => {
        res.set('Content-Type', 'text/xml')
        res.end(res.data)
    })

    // Get our initialized service so that we can register hooks
    const service = app.service('dummy')

    service.hooks(hooks)
}
