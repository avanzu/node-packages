import { ContainerModule, interfaces } from 'inversify'
import * as koa from 'inversify-koa-utils'
import { MonitoringController } from '../controllers/monitoring'
export const monitoringModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<koa.interfaces.Controller>(koa.TYPE.Controller).to(MonitoringController).whenTargetNamed('MonitoringController')
})