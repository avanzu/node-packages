import * as Kernel from '@avanzu/kernel'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { Config, Context, User } from '../interfaces'
import { AppService } from '../services/appService'

@Kernel.Controller()
export class AppController {
    protected service: AppService
    protected authUser: User
    protected config : Config
    constructor(appService: AppService, authUser: User, appConfig: Config) {
        this.service = appService
        this.authUser = authUser
        this.config = appConfig
    }

    @Kernel.Get('/health')
    async health(context: Context) {
        context.body = ReasonPhrases.OK
        context.status = StatusCodes.OK
    }

    @Kernel.Get('/info')
    async info(context: Context) {
        const service = await this.service.info()

        context.body = { service, authUser: this.authUser }
    }

    /*
    @Kernel.Get('/openapi.json')
    async apidocs(context: Context) {
        const info = await this.service.info()
        const generator = new Kernel.OpenApi({
            description: info!.description,
            version: info!.version,
            title: info!.name,
            namespace: this.config.get('namespace')
        })

        context.body = generator.generate()
    }
    */
}
