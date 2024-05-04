import { GeneratorContext, GeneratorArguments } from "../../../common/context";
import { Template } from "../../../common/template";

export class AppController implements Template {
    directory: string = './src/application/controllers';
    filename: string = 'appController.ts';
    async render(context: GeneratorContext<GeneratorArguments>): Promise<string> {
        return `
        import { ReasonPhrases, StatusCodes } from 'http-status-codes'
        import { AppService } from '../services/appService'
        import { Context } from '../interfaces'
        import { Controller, Get } from '@avanzu/kernel'


        @Controller()
        export class AppController {
            private service: AppService

            constructor(appService: AppService) {
                this.service = appService
            }

            @Get('/health')
            async health(context: Context) {
                context.body = ReasonPhrases.OK
                context.status = StatusCodes.OK
            }

            @Get('/info')
            async info(context: Context) {
                context.body = await this.service.info()
            }
        }

        `
    }

}