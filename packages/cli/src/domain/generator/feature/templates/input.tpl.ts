import { GeneratorContext, GeneratorArguments } from '../../common/context'
import { Template } from '../../common/template'

export type FeatureArgs = {
    featureName: string
    featureClassName: string
    featureId: string
}

export class InputTemplate implements Template {
    constructor(protected args: FeatureArgs) {}

    get directory(): string {
        return `./src/domain/features/${this.args.featureName}`
    }

    get filename(): string {
        return 'input.ts'
    }

    render(context: GeneratorContext<GeneratorArguments>): string | Promise<string> {
        return `
        import { Type, type Static } from '@sinclair/typebox'
        export const ${this.args.featureClassName}InputSchema = Type.Object({
        })

        export type ${this.args.featureClassName}Input = Static<typeof ${this.args.featureClassName}InputSchema>
        `
    }
}
