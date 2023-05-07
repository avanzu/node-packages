const { RenderJob } = require("../..")
const {ChainRenderer, HBSRenderer, MarkdownRenderer} = require('../../renderers')

describe('The chain renderer', () => {

    const renderer = new ChainRenderer(
        new MarkdownRenderer(),
        new HBSRenderer()
        )

    test('chaining', async() => {

        const job = new RenderJob({syntax: 'text/markdown+handlebars', template: '[{{foo}}](http://example.com)', variables: { foo: 'bar' }})
        const content = await renderer.render(job)

        expect(content.trim()).toBe('<p><a href="http://example.com">bar</a></p>')
    })

})