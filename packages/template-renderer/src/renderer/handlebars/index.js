const { Renderer } = require("..");
const HBS = require('handlebars');
const { RenderJob } = require("../../job");

exports.HBSRenderer = class HBSRenderer extends Renderer {

    constructor(){
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