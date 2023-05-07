const { Renderer } = require('..')

exports.ChainRenderer = class ChainRenderer extends Renderer {
    constructor(...renderers) {
        super()
        this.renderers = renderers
    }

    suitable(job) {
        return this.renderers.filter((renderer) => renderer.supports(job.syntax))
    }

    async render(job) {

        for (const curr of this.suitable(job)) {
            job.update(await curr.render(job))
        }

        return job.content
    }

}
