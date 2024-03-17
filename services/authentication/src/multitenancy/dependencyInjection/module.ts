import {ContainerModule, interfaces} from 'inversify'
import * as koa from 'inversify-koa-utils'
import { TenantInfoController } from '../controllers/tenantInfo'
export const multitenancyModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<koa.interfaces.Controller>(koa.TYPE.Controller).to(TenantInfoController).whenTargetNamed('TenantInfoController')
})