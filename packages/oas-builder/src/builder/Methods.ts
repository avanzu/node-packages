import { defaults } from "./Components"

export const GET = 'get'
export const POST = 'post'
export const PUT = 'put'
export const PATCH = 'patch'
export const DELETE = 'delete'
export const OPTIONS = 'options'
export const HEAD = 'head'

export const HTTPVerbs = {
    GET,
    POST,
    PUT,
    PATCH,
    DELETE,
    OPTIONS,
    HEAD,
}

export type HTTPVerb = keyof typeof HTTPVerbs
export default HTTPVerbs