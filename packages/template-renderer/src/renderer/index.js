const { UnsupportedSyntax } = require("../errors")

exports.Renderer = class Renderer {

    supports(syntax) {
        return false
    }

    async render(job){
        throw UnsupportedSyntax.fromJob(job)
    }

}

