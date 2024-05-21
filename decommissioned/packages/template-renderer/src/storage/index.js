exports.Storage = class Storage {
    /**
     *
     * @param {RenderJob} job
     * @returns {RenderJob}
     */
    // eslint-disable-next-line no-unused-vars
    async has(job) {
        return false
    }

    /**
     *
     * @param {RenderJob} job
     * @returns {RenderJob}
     */
    async hydrate(job) {
        return job
    }
    /**
     *
     * @param {RenderJob} job
     * @returns {RenderJob}
     */
    async store(job) {
        return job
    }
}
