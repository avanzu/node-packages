const { RenderJob } = require("../..");
const { HBSRenderer } = require("../../renderers")

describe('handlebars renderer', () => {

    const renderer = new HBSRenderer()

    it('should render', async () => {

        const content = await renderer.render(new RenderJob({
            template: 'hello {{bar}}',
            variables: { bar: 'foo' }
        }))

        expect(content).toBe('hello foo')
    });

})