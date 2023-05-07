const { Storage } = require('.')
const { CacheMiss } = require('../errors')
const { RenderJob } = require('../job')
const { LRUCache } = require('lru-cache')

exports.LRUStorage = class LRUStorage extends Storage {

    constructor({ maxEntries = 1000, ttl = 5000 } = {}) {
        super()
        this.entries = new LRUCache({ max: maxEntries, ttl })
        this.maxEntries = maxEntries
        this.ttl = ttl
    }

    /**
     *
     * @param {RenderJob} job
     * @returns {RenderJob}
     */
    async has(job) {
        return this.entries.peek(job.hash)
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