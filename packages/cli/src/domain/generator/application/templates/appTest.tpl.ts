import { GeneratorContext, GeneratorArguments } from "../../common/context";
import { Template } from "../../common/template";
import { PackageJSONArguments } from "./package.json.tpl";

export class AppTest implements Template {
    directory: string = './__tests__';
    filename: string = 'app.spec.ts';
    async render(context: GeneratorContext<PackageJSONArguments>): Promise<string> {

        return `
        import config from 'config'
        import { ReasonPhrases, StatusCodes } from 'http-status-codes'
        import request from 'supertest'
        import { AppKernel } from '~/application/appKernel'
        describe('${context.packageName}', () => {
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

        `

    }

}