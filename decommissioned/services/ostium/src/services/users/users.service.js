// Initializes the `users` service on path `/users`
const memory = require('feathers-memory')
const hooks = require('./users.hooks')
const users = require('../../../fixtures/users.json')

module.exports = function (app) {
    const options = {
        paginate: app.get('paginate'),
    }

    // Initialize our service with any options it requires
    app.use('/users', memory(options))

    // Get our initialized service so that we can register hooks
    const service = app.service('users')

    service.hooks(hooks)
    users.forEach((user) => {
        console.log('Adding user %s', user.username)
        service.create(user)
    })
}
