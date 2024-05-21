import Builder from './builder'
export const document = Builder.Doc.new
export const info = Builder.Info.new
export const server = Builder.Server.new
export const path = Builder.Path.new
export const operation = Builder.Operation.new
export const op = Builder.Operation.new
export const body = Builder.Body.new
export const request = Builder.Body.new
export const response = Builder.Body.new
export const reponse = Builder.Body.new
export const content = Builder.Content.new
export const param = Builder.Param.new
export const header = Builder.Header.new
export const ref = Builder.Ref.new
export const scheme = Builder.SecurityScheme.new
export const securityScheme = Builder.SecurityScheme.new
export const flow = Builder.OAuthFlow.new
export const oauthFlow = Builder.OAuthFlow.new
export const tag = Builder.Tag.new
export const example = Builder.Example.new
export const map = Builder.Collection.Map
export const list = Builder.Collection.List
export const StatusCode = Builder.StatusCodes
export const MediaType = Builder.MediaTypes
export const HTTPMethod = Builder.HTTPMethods

export default {
    document,
    info,
    server,
    path,
    operation,
    op,
    body,
    request,
    response,
    reponse,
    content,
    param,
    header,
    ref,
    scheme,
    securityScheme,
    flow,
    oauthFlow,
    tag,
    example,
    map,
    list,
    StatusCode,
    MediaType,
    HTTPMethod,
}
