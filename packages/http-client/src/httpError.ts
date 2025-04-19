import { pickSafeHeaders, sanitizeResponseData } from './helpers'

export type ResponseMeta = {
    url: string
    method: string
    stream?: boolean
}

export enum HTTPClientErrorTypes {
    UNKNOWN = 'unknown',
    CLIENT = 'client',
    SERVER = 'server',
    NETWORK = 'network',
    TIMEOUT = 'timeout',
    MALFORMED = 'malformed',
    HOOK = 'hook'
}

type ErrorType = `${HTTPClientErrorTypes}`

export class HTTPClientError extends Error {
    type: ErrorType = HTTPClientErrorTypes.UNKNOWN
    status: number = 500
    originalError: any
    name: string = 'HTTPError'
    stream: boolean = false

    constructor(message: string) {
        super(message)
    }
}

export class ResponseError extends HTTPClientError {
    name: string = 'ResponseError'

    constructor(res: Response, data: any, meta: ResponseMeta) {
        super(`HTTP ${res.status}: ${res.statusText}`)
        this.type = res.status >= 500 ? HTTPClientErrorTypes.SERVER : HTTPClientErrorTypes.CLIENT
        this.status = res.status
        this.stream = meta.stream || false
        this.originalError = {
            status: res.status,
            statusText: res.statusText,
            data: sanitizeResponseData(data),
            headers: pickSafeHeaders(res.headers),
            url: meta.url,
            method: meta.method,
        }
    }
}

export class RequestTimeoutError extends HTTPClientError {
    name: string = 'RequestTimeoutError'
    status: number = 408
    type: ErrorType = HTTPClientErrorTypes.TIMEOUT

    constructor(meta: ResponseMeta) {
        super('Request timed out')
        this.stream = meta.stream || false
        this.originalError = { url: meta.url, method: meta.method }
    }
}

export class NetworkError extends HTTPClientError {
    name: string = 'NetworkError'
    status: number = 503
    type: ErrorType = HTTPClientErrorTypes.NETWORK

    constructor(err: Error, meta: ResponseMeta) {
        super('Service unavailable or network unreachable')
        this.stream = meta.stream || false
        this.originalError = {
            message: err.message,
            url: meta.url,
            method: meta.method,
        }
    }
}

export class MalformedResponseError extends HTTPClientError {
    name = 'MalformedResponseError'
    type = HTTPClientErrorTypes.MALFORMED
    status: number = 502

    constructor(err: unknown, res: Response, url: string, method: string) {
        super('Malformed response received from server')

        this.status = res.status
        this.originalError = {
            message: err instanceof Error ? err.message : String(err),
            url,
            method,
            status: res.status,
            statusText: res.statusText,
            headers: Object.fromEntries(res.headers.entries()),
        }
    }
}

export class InvalidURLError extends HTTPClientError {
    name = 'InvalidURLError'
    type = HTTPClientErrorTypes.MALFORMED
    status: number = 400

    constructor(url: string, baseUrl?: string) {
        super('Invalid URL')

        this.originalError = { url, baseUrl }
    }
}

export enum HookTypes {
    BEFORE = 'before',
    AFTER = 'after'
}
export type HookType = `${HookTypes}`

export class LifecycleHookError extends HTTPClientError {
    name = 'LifecycleHookError'
    type = HTTPClientErrorTypes.HOOK
    status: number = 500
    hookType: HookType

    constructor(err: unknown, hookType: HookType) {
        super('Lifecycle hook error')
        this.hookType = hookType
        this.originalError = {
            message: err instanceof Error ? err.message : String(err),
        }
    }
}