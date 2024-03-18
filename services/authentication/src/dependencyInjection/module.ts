import { ContainerModule, interfaces } from 'inversify'
import pino, { Logger } from 'pino'
import { Config, TYPES } from '~/common'
import { Kernel } from '~/kernel'

export const rootModule = (kernel: Kernel, config: Config) => new ContainerModule((bind: interfaces.Bind) => {
    const loggerOptions = config.get('logger')
    bind<Kernel>(Kernel).toConstantValue(kernel)
    bind<Config>(TYPES.Config).toConstantValue(config)
    bind<Logger>(TYPES.Logger).toConstantValue(pino(loggerOptions))
})
