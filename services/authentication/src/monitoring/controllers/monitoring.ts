import { controller, httpGet, interfaces } from 'inversify-koa-utils'
import {injectable} from 'inversify'
import { Context } from '~/kernel';
import { StatusCodes, ReasonPhrases } from 'http-status-codes'

@controller('/')
@injectable()
export class MonitoringController implements interfaces.Controller {

    @httpGet('health')
    async health(context: Context) {
        context.body = ReasonPhrases.OK
        context.status = StatusCodes.OK
    }
}