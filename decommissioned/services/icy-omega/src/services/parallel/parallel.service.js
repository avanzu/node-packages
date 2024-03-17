// Initializes the `parallel` service on path `/parallel`
const { Parallel } = require('./parallel.class')
const hooks = require('./parallel.hooks')

module.exports = function (app) {
    const options = {
        paginate: app.get('paginate'),
    }

    // Initialize our service with any options it requires
    app.use('/parallel', new Parallel(options, app), (req, res) => {
        res.set('Content-Type', 'text/xml')
        res.end(res.data)
    })

    // Get our initialized service so that we can register hooks
    const service = app.service('parallel')

    service.hooks(hooks)
}
