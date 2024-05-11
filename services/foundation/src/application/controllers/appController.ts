import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { AppService } from '../services/appService'
import { Context, User } from '../interfaces'
import { Controller, Get } from '@avanzu/kernel'


@Controller()
export class AppController {
    private service: AppService
    private authUser: User
    constructor(appService: AppService, authUser: User) {
        this.service = appService
        this.authUser = authUser
    }

    @Get('/health')
    async health(context: Context) {

        context.body = ReasonPhrases.OK
        context.status = StatusCodes.OK
    }

    @Get('/info')
    async info(context: Context) {
        let service = await this.service.info()

        context.body = { service, authUser: this.authUser }
    }
}
