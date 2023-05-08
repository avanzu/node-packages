const { UnsupportedSyntax } = require('../errors')

exports.Renderer = class Renderer {
    // eslint-disable-next-line no-unused-vars
    supports(syntax) {
        return false
    }

    async render(job) {
        throw UnsupportedSyntax.fromJob(job)
    }
}
