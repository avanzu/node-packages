const dummy = require('./dummy/dummy.service.js')
const parallel = require('./parallel/parallel.service.js')
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
    app.configure(dummy)
    app.configure(parallel)
}
