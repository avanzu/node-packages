exports.CacheMiss = class CacheMiss extends Error {
    static fromJob(job) {
        return new CacheMiss(`No cache entry found for job ${job.hash}`)
    }
}

exports.UnsupportedSyntax = class UnsupportedSyntax extends Error {
    constructor(message) {
        super(message)
    }

    static fromJob(job) {
        return new UnsupportedSyntax(`Renderer does not support "${job.syntax}".`)
    }
}
