const { MarkdownRenderer } = require('../../renderers')
const fs = require('node:fs/promises')
const path = require('node:path')
const { RenderJob } = require('../..')

const state = { items: 10 }
const fixture = (filename) => path.join(__dirname, '..', '__fixtures__', filename)

describe('The markdown renderer', () => {
    beforeAll(async () => {
        state.contents = await fs.readFile(fixture('markdown.md'), 'utf-8')
    })

    const renderer = new MarkdownRenderer()

    it('should render', async () => {
        const promises = Array.from({ length: state.items }).map(() => {
            return renderer.render(RenderJob.markdown(state.contents))
        })

        const [content] = await Promise.all(promises)

        expect(content.length).toBe(6338)
    })

    it('should sanitize xss', async () => {
        const xssPayload = await fs.readFile(fixture('xss.md'), 'utf-8')
        const content = await renderer.render(RenderJob.markdown(xssPayload))

        expect(content).not.toContain('<a href')
        //expect(content.length).toBe(0)
    })

    it('should be able to process large structures', async () => {
        const table = await fs.readFile(fixture('table.md'), 'utf-8')
        const content = await renderer.render(RenderJob.markdown(table))

        expect(content).toBeDefined()
    })
})
