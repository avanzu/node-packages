import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { GET, route } from 'awilix-koa'
import { AppService } from '../services/appService'
import { Context } from '../interfaces'

@route('')
export class AppController {
    private service: AppService

    constructor(appService: AppService) {
        this.service = appService
    }

    @GET()
    @route('/health')
    async health(context: Context) {
        context.body = ReasonPhrases.OK
        context.status = StatusCodes.OK
    }

    @GET()
    @route('/info')
    async info(context: Context) {
        context.body = await this.service.info()
    }
}
