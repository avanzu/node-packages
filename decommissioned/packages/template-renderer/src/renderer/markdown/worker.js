const createDOMPurify = require('dompurify')
const { JSDOM } = require('jsdom')

const window = new JSDOM('').window
const DOMPurify = createDOMPurify(window)
const markdown = require('markdown-it')({ html: true, xhtmlOut: true, breaks: true })

exports.render = ({ template, variables = {} }) => {
    return markdown.render(template)
}
exports.sanitize = ({ html }) => {
    return DOMPurify.sanitize(html)
}
