import config from 'config'
import { ReasonPhrases, StatusCodes } from "http-status-codes"
import request from 'supertest'
import { AppKernel } from "~/application/appKernel"
import { Server } from 'node:net'
describe('@avanzu/foundation', () => {

    let app: AppKernel
    let server: Server

    beforeAll(async () => {

        app = new AppKernel(config)
        await app.boot()
        await app.serve()
        server = app.httpServer!
    })

    afterAll(async () => {
        await app.shutdown()
    })

    test('sanity', async () => {
        let response = await request(server).get('/health')
        expect(response.status).toBe(StatusCodes.OK)
        expect(response.body).toBe(ReasonPhrases.OK)
    })

})