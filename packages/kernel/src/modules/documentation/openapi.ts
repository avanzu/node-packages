import OAS, { TDoc, TPath } from '@avanzu/oas-builder'

import { ControllerDocumentor } from './controllerDocumentor'
import type { Container } from '~/interfaces'
import { getApiDocs, getControllers, getMountPoints } from '~/decorators'
import type {
    ApiDocsOpts,
    Documentor,
    GenricDocumentor,
    CustomDocumentor,
    Endpoint,
    DocumentorContext,
} from '~/decorators'

export type InfoBlock = {
    version: string
    description: string
    title: string
    namespace?: string
}

export class OpenApi {
    protected paths: Map<string, TPath>
    protected document: TDoc
    protected tags: Set<string>

    constructor(
        protected info: InfoBlock,
        protected container: Container
    ) {}

    generate() {
        this.paths = new Map()
        this.document = OAS.document()
        this.tags = new Set()

        const info = OAS.info()
            .title(this.info.title)
            .summary(this.info.description)
            .version(this.info.version)

        for (const controller of getControllers()) {
            this.processController(controller)
        }

        this.document = this.document.paths(Object.fromEntries(this.paths))

        return this.document.info(info).valueOf()
    }

    private addTag(opts: ApiDocsOpts) {
        if (null == opts.tag) return
        if(! this.tags.has(opts.tag.name)) {
            this.document = this.document.tag(
                OAS.tag().name(opts.tag.name).description(opts.tag.description)
            )
            this.tags.add(opts.tag.name)
        }
    }

    private processController(controller: Function) {
        const opts = getApiDocs(controller)
        if (null == opts) return
        this.addTag(opts)
        const generator = opts.generator ? opts.generator() : ControllerDocumentor
        const mountpoint = getMountPoints(controller)
        const documentor = this.container.build<Documentor>(generator)

        for (const endpoint of mountpoint.endpoints) {
            const context: DocumentorContext = {
                endpoint,
                mountpoint,
                opts,
                info: this.info,
                container: this.container,
            }
            if (this.isCustomDocumentor(documentor)) {
                this.useCustomDocumentor(endpoint, documentor, context)
            } else if (this.isGenericDocumentor(documentor)) {
                this.useGenericDocumentor(documentor, context)
            }
        }
    }

    private isGenericDocumentor(value: Documentor): value is GenricDocumentor {
        return 'kind' in value && value.kind === 'generic'
    }

    private isCustomDocumentor(value: Documentor): value is CustomDocumentor {
        return 'kind' in value && value.kind === 'custom'
    }

    private useCustomDocumentor(
        endpoint: Endpoint,
        documentor: CustomDocumentor<any>,
        context: DocumentorContext
    ) {
        if (false === endpoint.method in documentor) {
            return
        }
        const { route, verb, operation } = documentor[String(endpoint.method)].call(
            documentor,
            context
        )
        const path = this.paths.has(route) ? this.paths.get(route) : OAS.path()
        this.paths.set(route, path.method(verb, operation))
    }

    private useGenericDocumentor(documentor: GenricDocumentor<any>, context: DocumentorContext) {
        const { route, verb, operation } = documentor.getInfo(context)
        const path = this.paths.has(route) ? this.paths.get(route) : OAS.path()
        this.paths.set(route, path.method(verb, operation))
    }
}
