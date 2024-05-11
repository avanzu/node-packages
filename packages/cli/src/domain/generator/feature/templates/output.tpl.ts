import { GeneratorContext, GeneratorArguments } from '../../common/context'
import { Template } from '../../common/template'

export type FeatureArgs = {
    featureName: string
    featureClassName: string
    featureId: string
}

export class OutputTemplate implements Template {
    constructor(protected args: FeatureArgs) {}

    get directory(): string {
        return `./src/domain/features/${this.args.featureName}`
    }

    get filename(): string {
        return 'output.ts'
    }

    render(context: GeneratorContext<GeneratorArguments>): string | Promise<string> {
        return `
        import { Type, type Static } from '@sinclair/typebox'
        export const ${this.args.featureClassName}OutputSchema = Type.Object({
        })

        export type ${this.args.featureClassName}Output = Static<typeof ${this.args.featureClassName}OutputSchema>
        `
    }
}
