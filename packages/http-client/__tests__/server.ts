// testServer.ts
import http, { IncomingMessage, ServerResponse } from 'http'
import { PassThrough } from 'stream'

export type TestServer = {
    start: () => Promise<number>
    stop: () => Promise<void>
}

export function createTestServer(): TestServer {
    let server: http.Server
    const port = 0 // Let OS pick a free port
    const promises = []
    return {
        async start() {
            return new Promise<number>((resolve, reject) => {
                server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
                    const { url, method } = req

                    if (url === '/ok') {
                        res.writeHead(200, { 'Content-Type': 'application/json' })
                        res.end(JSON.stringify({ message: 'ok' }))
                    }
                    else if (url?.startsWith('/timeout')) {
                        const delay = Number(new URL(req.url!, `http://${req.headers.host}`).searchParams.get('delay')) || 500
                        promises.push(new Promise((ok) => {
                            setTimeout(() => {
                                res.writeHead(200, { 'Content-Type': 'application/json' })
                                res.end(JSON.stringify({ message: 'ok after timeout' }))
                                ok(null)
                            }, delay)
                        }))
                    }
                    else if (url === '/404') {
                        res.writeHead(404, { 'Content-Type': 'text/plain' })
                        res.end('Not Found')
                    } else if (url === '/bad-request') {
                        res.writeHead(400, { 'Content-Type': 'application/json' })
                        res.end(JSON.stringify({ error: 'bad request' }))
                    } else if (url === '/server-error') {
                        res.writeHead(500, { 'Content-Type': 'application/json' })
                        res.end(JSON.stringify({ error: 'internal error' }))
                    } else if (url === '/malformed-json') {
                        res.writeHead(200, { 'Content-Type': 'application/json' })
                        res.end('{ malformed json')
                    } else if (url === '/stream') {
                        res.writeHead(200, { 'Content-Type': 'application/octet-stream' })
                        const stream = new PassThrough()
                        stream.pipe(res)
                        stream.write('streaming data chunk')
                        stream.end()
                    } else {
                        res.writeHead(404)
                        res.end()
                    }
                })

                server.listen(port, () => {
                    const address = server.address()
                    if (address && typeof address === 'object') {
                        resolve(address.port)
                    } else {
                        reject(new Error('Unable to determine port'))
                    }
                })
            })
        },

        async stop() {
            await Promise.allSettled(promises)
            await new Promise((OK, Err) => server?.close((e?: Error) => e ? Err(e) : OK(null)))
        },
    }
}
