import { MikroORM } from '@mikro-orm/core'
import config from 'config'
import { resolveAsyncConfigs } from 'config/async'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import request from 'supertest'
import { AppKernel } from '~/application/appKernel'
import { ORMProvider } from '~/application/dependencyInjection'
import { TestKernel } from '~tests/testKernel'
import { createMock } from './createMock'
describe('@avanzu/foundation', () => {
    let app: AppKernel
    let ormProvider: jest.Mocked<ORMProvider>
    let orm: jest.Mocked<MikroORM>
    beforeAll(async () => {
       orm = createMock<MikroORM>({
       })

       ormProvider = createMock<ORMProvider>({
            dispose: jest.fn(),
            init: jest.fn(),
            entityManager: jest.fn(),
            getORM: jest.fn(),
        })

        await resolveAsyncConfigs(config)
        app = new TestKernel(config, { ORMProvider: ormProvider })
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
