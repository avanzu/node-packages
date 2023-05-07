const { Piscina } = require('piscina')
const markdown = require('markdown-it')
const path = require('path')
const { Renderer } = require('..')
const { RenderJob } = require('../../job')
const { UnsupportedSyntax } = require('../../errors')

exports.MarkdownRenderer = class MarkdownRenderer extends Renderer {
    constructor(options = {}) {
        super()
        this.workers = new Piscina({
            filename: path.join(__dirname, 'worker.js'),
        })

        this.md = markdown(options)
    }

    supports(syntax) {
        return syntax.includes('markdown')
    }
    /**
     *
     * @param {RenderJob} job
     * @returns {Promise<string>}
     */
    async render(job) {
        const { template, variables, syntax } = job
        if (!this.supports(syntax)) {
            throw new UnsupportedSyntax.fromJob(job)
        }
        const html = await this.workers.run({ template, variables }, { name: 'render' })
        const contents = await this.workers.run({ html }, { name: 'sanitize' })
        return contents
    }
}
