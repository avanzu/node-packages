const Builder = require('./builder')
exports.document = Builder.Doc.new
exports.info = Builder.Info.new
exports.server = Builder.Server.new
exports.path = Builder.Path.new
exports.operation = Builder.Operation.new
exports.op = Builder.Operation.new
exports.body = Builder.Body.new
exports.request = Builder.Body.new
exports.response = Builder.Body.new
exports.reponse = Builder.Body.new
exports.content = Builder.Content.new
exports.param = Builder.Param.new
exports.header = Builder.Header.new
exports.ref = Builder.Ref.new
exports.scheme = Builder.SecurityScheme.new
exports.securityScheme = Builder.SecurityScheme.new
exports.flow = Builder.OAuthFlow.new
exports.oauthFlow = Builder.OAuthFlow.new
exports.tag = Builder.Tag.new

exports.map = Builder.Collection.Map
exports.list = Builder.Collection.List

exports.StatusCode = Builder.StatusCodes
exports.MediaType = Builder.MediaTypes
exports.HTTPMethod = Builder.HTTPMethods
