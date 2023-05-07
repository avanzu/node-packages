jest.mock('../src/storage/memory')
jest.mock('../src/renderer')

const { Engine, RenderJob, Errors } = require('..')
const { MemoryStorage } = require('../src/storage/memory')
const { Renderer } = require('../src/renderer')
const { LRUStorage } = require('../storages')
const { MarkdownRenderer } = require('../renderers')
const {CacheMiss, UnsupportedSyntax} = Errors
const fs = require('node:fs/promises')
const path = require('node:path')

describe('The rendering engine', () => {

    const storage = new MemoryStorage()
    const renderer = new Renderer()


    const engine = new Engine({ storage, renderer })

    test('construction', () => {

        expect(engine).toHaveProperty('storage', storage)
        expect(engine).toHaveProperty('renderer', renderer)
    })


    test('happy path', async () => {

        renderer.supports.mockReturnValue(true)
        renderer.render.mockResolvedValue('the rendered template')
        storage.has.mockResolvedValue(true)
        storage.hydrate.mockImplementation(async (job) => job.update('the rendered template', 999))
        storage.store.mockImplementation(async (job) => job)

        const job = new RenderJob({ syntax: 'text/markdown', template: 'the template' })

        await engine.render(job)

        expect(job.content).toEqual('the rendered template')
        expect(job.age).toEqual(999)


    })

    test('cache miss', async () => {

        storage.has.mockResolvedValue(true)
        storage.hydrate.mockImplementation(async (job) => {
            throw CacheMiss.fromJob(job)
        })

        const job = new RenderJob({ syntax: 'text/markdown', template: 'the template' })
        await expect(engine.render(job)).rejects.toThrow(CacheMiss)

    })

    test('Unsupported syntax', async() => {
        storage.has.mockResolvedValue(false)
        renderer.supports.mockReturnValue(false)
        renderer.render.mockImplementation(async (job) => {
            throw UnsupportedSyntax.fromJob(job)
        })

        const job = new RenderJob({ syntax: 'text/markdown', template: 'the template' })

        await expect(engine.render(job)).rejects.toThrow(UnsupportedSyntax)

    })


    describe('markdown + lru', () => {
        const engine = new Engine({
            storage: new LRUStorage({ maxEntries: 100, ttl: 5000 }),
            renderer: new MarkdownRenderer({})
        })

        test('render and cache', async () => {

            const renderSpy = jest.spyOn(engine.renderer, 'render')
            const markdown = await fs.readFile(path.join(__dirname, '__fixtures__', 'markdown.md'), 'utf-8')
            await engine.render(RenderJob.markdown(markdown))

            const promises = Array.from({length: 100}).map(async () => {
                return engine.render(RenderJob.markdown(markdown))
            })

            const [job] = await Promise.all(promises)

            expect(renderSpy).toHaveBeenCalledTimes(1)
            expect(job.content).toHaveLength(6338)
            expect(job.cached).toBe(true)
        })

    })

})