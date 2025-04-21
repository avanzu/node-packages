import { parseJSONOrThrow as resolveBody, tryParseJSON as safeResolveBody } from './helpers'
import {
    HTTPClientError,
    InvalidURLError,
    LifecycleHookError,
    NetworkError,
    RequestTimeoutError,
    ResponseError,
    ResponseMeta,
} from './httpError'

export type HttpClientOptions = {
    timeout?: number
    baseUrl?: string
}

export type HttpRequestOptions = RequestInit & {
    query?: Record<string, string | number | boolean>
    headers?: HeadersInit
    stream?: boolean
}

type RequestOpts = HttpRequestOptions & { url: string }

type BeforeHook = (options: RequestOpts) => RequestOpts | Promise<RequestOpts> | void
type AfterHook = (res: Response, options: RequestOpts) => void | Promise<void>

// httpClient.ts
export class HttpClient {
    private timeout: number
    private baseUrl?: string

    private beforeHook?: BeforeHook
    private afterHook?: AfterHook

    constructor({ timeout = 5000, baseUrl }: HttpClientOptions = {}) {
        this.timeout = timeout
        this.baseUrl = baseUrl
    }

    onBeforeRequest(hook?: BeforeHook) {
        this.beforeHook = hook
        return this
    }
    onResponse(hook?: AfterHook) {
        this.afterHook = hook
        return this
    }

    async get<RES = any>(url: string, options: HttpRequestOptions = {}) :Promise<RES> {
        return this.request<RES>(url, { ...options, method: 'GET' })
    }

    async post<RES = any>(url: string, jsonBody: any, options: HttpRequestOptions = {}): Promise<RES> {
        const headers = { 'Content-Type': 'application/json', ...options.headers }
        const body = JSON.stringify(jsonBody)
        return this.request<RES>(url, { ...options, method: 'POST', body, headers })
    }

    async put<RES = any>(url: string, jsonBody: any, options: HttpRequestOptions = {}): Promise<RES> {
        const headers = { 'Content-Type': 'application/json', ...options.headers }
        const body = JSON.stringify(jsonBody)
        return this.request<RES>(url, { ...options, method: 'PUT', body, headers })
    }

    async delete<RES = any>(url: string, options: HttpRequestOptions = {}): Promise<RES> {
        return this.request<RES>(url, { ...options, method: 'DELETE' })
    }

    private async handleResponse(res: Response, url: string, method: string, stream?: boolean) {
        if (false === res.ok) {
            const meta = { url, method, stream: Boolean(stream) }
            throw new ResponseError(res, await safeResolveBody(res), meta)
        }
        return stream ? res.body : await resolveBody(res, url, method)
    }

    private async runBeforeHook(options: RequestOpts): Promise<RequestOpts> {
        if (!this.beforeHook) return options
        try {
            const opts = await this.beforeHook(options)
            return opts || options
        } catch (err: any) {
            throw new LifecycleHookError(err, 'before')
        }
    }
    private async runAfterHook(res: Response, options: RequestOpts): Promise<void> {
        if (!this.afterHook) return
        try {
            await this.afterHook(res, options)
        } catch (err: any) {
            throw new LifecycleHookError(err, 'after')
        }
    }

    public async request<RES = any>(url: string, options: HttpRequestOptions = {}): Promise<RES> {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), this.timeout)
        const method = options.method || 'GET'
        const stream = options.stream || false
        const resolvedUrl = this.resolveUrl(url)

        const meta = { url: resolvedUrl, method, stream }

        const opts = await this.runBeforeHook({ ...options, ...meta })

        try {
            const res = await fetch(resolvedUrl, { ...opts, signal: controller.signal })
            await this.runAfterHook(res, { ...opts, ...meta })
            return this.handleResponse(res, resolvedUrl, method, stream)
        } catch (err: any) {
            const error = this.convertError(err, meta)
            throw error
        } finally {
            clearTimeout(timer)
        }
    }

    private convertError(err: any, meta: ResponseMeta): HTTPClientError {
        if (err instanceof HTTPClientError) return err
        if (err.name === 'AbortError') return new RequestTimeoutError(meta)
        return new NetworkError(err, meta)
    }

    private resolveUrl(url: string): string {
        try {
            return new URL(url, this.baseUrl).toString()
        } catch {
            throw new InvalidURLError(url, this.baseUrl)
        }
    }
}
