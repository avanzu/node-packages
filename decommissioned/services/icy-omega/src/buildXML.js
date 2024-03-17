const xml2js = require('xml2js')
const { Result } = require('@avanzu/std')

const builder = new xml2js.Builder({
    separateArrayItems: false,
    attrNameProcessors: [(name) => name.toUppercase()],
})

exports.buildXML = Result.try((json) => builder.buildObject(json))
