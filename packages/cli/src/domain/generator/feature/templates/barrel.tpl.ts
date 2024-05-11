import { GeneratorContext, GeneratorArguments } from '../../common/context'
import { Template } from '../../common/template'

export type FeatureArgs = {
    featureName: string
    featureClassName: string
    featureId: string
}

export class FeatureTemplate implements Template {
    constructor(protected args: FeatureArgs) {}

    get directory(): string {
        return `./src/domain/features/${this.args.featureName}`
    }

    get filename(): string {
        return 'index.ts'
    }

    render(context: GeneratorContext<GeneratorArguments>): string | Promise<string> {
        return `
            export * from './feature'
            export * from './input'
            export * from './output'
        `
    }
}
