import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { AppService } from '../services/appService'
import { Context, User } from '../interfaces'
import { Controller, Get, PermissionKind } from '@avanzu/kernel'
import { authorize } from '../middleware/authorize'


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

    @Get('/test-auth', authorize({ kind: PermissionKind.ACTION, name: 'test-auth' }))
    async testAuth(context: Context) {
        let service = await this.service.info()

        context.body = { service, authUser: this.authUser }
    }
}
