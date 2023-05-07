const { createHash } = require('node:crypto')

exports.RenderJob = class RenderJob {

    constructor({ syntax, template, ttl = Infinity, variables = {} }) {

        this.syntax = syntax
        this.variables = new URLSearchParams(variables)
        this.variables.sort()
        this.content = null
        this.hash = createHash('md5').update(this.variables.toString().concat(template)).digest('hex')
        this.ttl = ttl
        this.age = 0
        this.template = template
        this.cached = false
    }

    update(content, age = 0, cached = false) {
        this.content = content
        this.template = content
        this.age = age
        this.cached = cached

        return this
    }

    static markdown(template, ttl = 1000) {
        return new RenderJob({ syntax: 'text/markdown', template, ttl })
    }

    get vars() {
        return Object.fromEntries(this.variables.entries())
    }
}
