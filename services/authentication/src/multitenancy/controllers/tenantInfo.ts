import { inject, injectable } from 'inversify'
import { controller, httpGet, interfaces } from 'inversify-koa-utils'
import { tenantResolver } from '../middleware/tenantResolver'
import { Context, TYPES, DatabaseConnectorFactory } from '~/common'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'
import { MongoClient } from 'mongodb'

@injectable()
@controller('/multitenancy', tenantResolver)
export class TenantInfoController implements interfaces.Controller {
    constructor(@inject(TYPES.Database) protected factory: DatabaseConnectorFactory<MongoClient>) {}

    @httpGet('/info')
    async info(ctx: Context) {
        const mongoClient = await this.factory.create(ctx.state.tenant.getId())

        ctx.status = StatusCodes.OK
        ctx.body = ReasonPhrases.OK
    }
}
