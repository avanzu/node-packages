// eslint-disable-next-line no-unused-vars
const { Renderer, RenderJob } = require('..')
const HBS = require('handlebars')

exports.HBSRenderer = class HBSRenderer extends Renderer {
    constructor() {
        super()
    }

    supports(syntax) {
        return syntax.includes('handlebars')
    }

    /**
     *
     * @param {RenderJob} job
     * @returns {Promise<string>}
     */
    async render(job) {
        const template = HBS.compile(job.template)
        return template(job.vars)
    }
}
