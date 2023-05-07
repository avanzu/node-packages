const EventEmitter = require('node:events')
const { RenderJob } = require('.')

exports.Engine = class Engine extends EventEmitter {

    /**
     *
     * @param {{storage: Storage, renderer: Renderer }} param0
     */
    constructor({ renderer, storage }){
        super()
        this.renderer = renderer
        this.storage = storage
    }

    /**
     *
     * @param {RenderJob} renderJob
     * @returns string
     */
    async render(renderJob) {


        if(await this.storage.has(renderJob)) {
            return await this.storage.hydrate(renderJob)
        }

        renderJob.update(await this.renderer.render(renderJob), 0)

        await this.storage.store(renderJob)

        return renderJob

    }

}