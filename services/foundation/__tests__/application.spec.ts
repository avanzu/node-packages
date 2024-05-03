import config from 'config'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import request from 'supertest'
import { AppKernel } from '~/application/appKernel'
describe('@avanzu/foundation', () => {
    let app: AppKernel

    beforeAll(async () => {
        app = new AppKernel(config)
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
