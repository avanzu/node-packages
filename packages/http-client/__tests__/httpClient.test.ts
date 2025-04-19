import { MalformedResponseError, RequestTimeoutError } from '~/httpError'
import { HttpClient } from '../src/httpClient' // adjust as needed
import { createTestServer, type TestServer } from './server'

let server: TestServer
let baseUrl: string

describe('HttpClient', () => {
    beforeAll(async () => {
        server = createTestServer()
        const port = await server.start()
        baseUrl = `http://localhost:${port}`
    })

    afterAll(async () => {
        await server.stop()
    })

    test('handles 200 OK', async () => {
        const client = new HttpClient()
        const res = await client.get(`${baseUrl}/ok`)
        expect(res).toEqual({ message: 'ok' })
    })

    test('handles 400 error', async () => {
        const client = new HttpClient()
        await expect(client.get(`${baseUrl}/bad-request`)).rejects.toThrow('HTTP 400')
    })
    test('handles 408 error', async () => {
        const client = new HttpClient({ timeout: 50 })
        await expect(client.get(`${baseUrl}/timeout?delay=100`)).rejects.toThrow(RequestTimeoutError)
    })

    test('handles malformed json', async () => {
        const client = new HttpClient()
        await expect(client.get(`${baseUrl}/malformed-json`)).rejects.toThrow(MalformedResponseError)
    })

    test('streams correctly', async () => {
        const client = new HttpClient()
        const stream = await client.get(`${baseUrl}/stream`, { stream: true })
        expect(stream).toBeInstanceOf(ReadableStream)
    })

})
