const { Storage } = require('.')
const { CacheMiss } = require('../errors')
const { RenderJob } = require('../job')

exports.MemoryStorage = class MemoryStorage extends Storage {

    constructor({ maxEntries = 1000 } = {}) {
        super()
        this.entries = new Map()
        this.maxEntries = maxEntries
    }

    /**
     *
     * @param {RenderJob} job
     * @returns {RenderJob}
     */
    async has(job) {
        return this.entries.has(job.hash)
    }

    /**
     *
     * @param {RenderJob} job
     * @returns {RenderJob}
     */
    async hydrate(job) {
        if(! this.entries.has(job.hash)) {
            throw CacheMiss.fromJob(job)
        }

        const { content, timestamp } = this.entries.get(job.hash)
        const age = Date.now() - timestamp
        job.update(content, age, true)
        return job
    }

    /**
     *
     * @param {RenderJob} job
     * @returns {RenderJob}
     */
    async store(job) {
        const entry = { content: job.content, timestamp: Date.now(), ttl: job.ttl }
        this.entries.set(job.hash, entry)
        return job

    }
}