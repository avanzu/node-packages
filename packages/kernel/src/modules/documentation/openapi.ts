import OAS, { TPath } from '@avanzu/oas-builder'
import { TDoc } from '@avanzu/oas-builder'
import { getControllers, getMountPoints } from '~/decorators'
import { join } from 'node:path'

export type InfoBlock = {
    version: string
    description: string
    title: string
    namespace?: string
}

export class OpenApi {
    constructor(protected info: InfoBlock) {}

    generate() {
        const paths = new Map<string, TPath>()

        for (const controller of getControllers()) {
            const mount = getMountPoints(controller)
            for (const endpoint of mount.endpoints) {
                const pathName = join(mount.prefix, endpoint.route)
                const operationId = `${endpoint.target.name}.${endpoint.method.toString()}`

                const op = OAS.op().id(operationId)
                paths.set(pathName, OAS.path().method(endpoint.verb, op))
            }
        }

        const pathDict = Object.fromEntries(paths)

        const doc = OAS.document().paths(pathDict)
        .info(
            OAS.info()
                .title(this.info.title)
                .summary(this.info.description)
                .version(this.info.version)
        )

        return doc.valueOf()
    }
}
