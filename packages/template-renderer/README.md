# `template-renderer`

## Usage

Simple setup to render markdown and cache the last 100 results for one hour.

```js
const { Engine, RenderJob } = require('@avanzu/template-renderer')
// select your storage
const { LRUStorage } = require('@avanzu/template-renderer/storages')
// select your renderer
const { MarkdownRenderer } = require('@avanzu/template-renderer/renderers')

// setup the rendering engine
const engine = new Engine({
    renderer: new MarkdownRenderer(),
    storage: new LRUStorage({ maxEntries: 100, ttl: 3_600_000 })
})

// render your template(s)
const output = await engine.render(
    RenderJob.markdown('***hello world***')
    )
```



## Extend

### Renderer

```js
const { Renderer, RenderJob } = require('@avanzu/template-renderer')

exports.CustomRenderer = class CustomRenderer extends Renderer {

    supports(syntax) {
        return syntax.includes('custom-template')
    }

    /**
     *
     * @param {RenderJob} job
     * @returns {Promise<string>}
     */
    async render(job) {
        const { template, vars } = job
        // do your rendering, return the rendered string

    }
}

```

### storage

```js
const { Storage, CacheMiss } = require('@avanzu/template-renderer')

exports.CustomStorage = class CustomStorage extends Storage {

    constructor(options) {
        super(options)
    }

    async has(job) {
        const { hash } = job
        // test whether your storage does contain the job hash
    }

    async hydrate(job) {
        // fetch the stored contents
        job.update(contents)
        return job
    }

    async store(job) {
        const { hash, content } = job
        // store the contents using hash as key

        return job
    }
}
```
