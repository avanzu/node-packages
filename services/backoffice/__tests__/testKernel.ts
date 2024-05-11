import { asFunction, asValue } from 'awilix'
import { AppKernel } from '~/application/appKernel'
import { Config, Services } from '~/application/interfaces'

export class TestKernel extends AppKernel {
    constructor(options: Config, protected mocks: Partial<Services> = {}) {
        super(options)
    }

    protected async buildContainer(): Promise<void> {
        await super.buildContainer()

        for(let [name, mock] of Object.entries(this.mocks)) {
            this.container.register(name, asValue(() => mock))
        }
    }
}
