export const JSON = 'application/json'
export const XML = 'application/xml'
export const FORM = 'multipart/form-data'
export const IMAGE = 'image/*'
export const JPEG = 'image/jpeg'
export const PNG = 'image/png'
export const SVG = 'image/svg'
export const TEXT = 'text/plain'
export const SSE = 'text/event-stream'
export const ANY = '*/*'

export const ContentTypes = {
    JSON,
    XML,
    FORM,
    IMAGE,
    JPEG,
    PNG,
    SVG,
    TEXT,
    SSE,
    ANY,
}

export type ContentType = keyof typeof ContentTypes

export default ContentTypes