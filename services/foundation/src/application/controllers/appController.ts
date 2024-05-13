import * as Kernel from '@avanzu/kernel'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { Context, User } from '../interfaces'
import { AppService } from '../services/appService'

@Kernel.Controller()
export class AppController {
    private service: AppService
    private authUser: User
    constructor(appService: AppService, authUser: User) {
        this.service = appService
        this.authUser = authUser
    }

    @Kernel.Get('/health')
    async health(context: Context) {
        context.body = ReasonPhrases.OK
        context.status = StatusCodes.OK
    }

    @Kernel.Get('/info')
    async info(context: Context) {
        let service = await this.service.info()

        context.body = { service, authUser: this.authUser }
    }
}
