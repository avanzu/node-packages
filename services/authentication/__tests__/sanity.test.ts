import { createClient } from 'redis'
describe('The integration test sanity check', () => {
    test('sanity', async () => {
        const client = createClient({
            url: process.env.REDIS_URL
        })

        const ready = new Promise(OK => client.on('ready', OK))
        await expect(ready).resolves.toBeUndefined()
    })
})