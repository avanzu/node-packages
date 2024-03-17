const { buildXML } = require('./buildXML')

exports.toXML = (data) => buildXML(data).promise()
