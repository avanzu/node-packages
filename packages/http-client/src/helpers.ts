import { MalformedResponseError } from './httpError'

export function sanitizeResponseData(data: unknown) {
    if (!data) return null
    if (typeof data === 'string' && data.length > 500) {
        return data.slice(0, 500) + '... [truncated]'
    }
    return data
}

export function pickSafeHeaders(headers: Headers) {
    const safe: Record<string, string> = {}
    for (const [key, value] of headers.entries()) {
        if (['content-type', 'x-request-id'].includes(key.toLowerCase())) {
            safe[key] = value
        }
    }
    return safe
}

export async function tryParseJSON(res: Response) {
    const contentType = res.headers.get('content-type')
    if (contentType?.includes('application/json')) {
        try {
            return await res.json()
        } catch {
            return '[invalid JSON]'
        }
    }
    return await res.text()
}

export async function parseJSONOrThrow(res: Response, url: string, method: string) {
    try {
        const contentType = res.headers.get('content-type')
        if (contentType?.includes('application/json')) {
            return await res.json()
        }
        return await res.text()
    } catch (err) {
        throw new MalformedResponseError(err, res, url, method)
    }
}
