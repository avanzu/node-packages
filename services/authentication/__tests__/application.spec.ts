import config from 'config'
import { resolveAsyncConfigs } from 'config/async'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import request from 'supertest'
import { AppKernel } from '~/application/appKernel'
import { TestKernel } from '~tests/testKernel'
describe('@avanzu/foundation', () => {
    let app: AppKernel

    beforeAll(async () => {
        await resolveAsyncConfigs(config)
        app = new TestKernel(config)
        await app.boot()
        await app.serve()
    })

    afterAll(async () => {
        await app.shutdown()
    })

    test('sanity', async () => {
        let response = await request(app.server).get('/health')
        expect(response.status).toBe(StatusCodes.OK)
        expect(response.text).toBe(ReasonPhrases.OK)
    })
})
