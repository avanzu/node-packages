import { GeneratorContext, GeneratorArguments } from '../../common/context'
import { Template } from '../../common/template'

export type FeatureArgs = {
    featureName: string
    featureClassName: string
    featureId: string
}

export class BarrelTemplate implements Template {
    constructor(protected args: FeatureArgs) {}

    get directory(): string {
        return `./src/domain/features/${this.args.featureName}`
    }

    get filename(): string {
        return 'feature.ts'
    }

    render(context: GeneratorContext<GeneratorArguments>): string | Promise<string> {
        return `
        import { UseCase } from "@avanzu/kernel";
        import { Feature } from "~/domain/interfaces";
        import {
            ${this.args.featureClassName}Input as Input,
            ${this.args.featureClassName}InputSchema as InputSchema
        } from './input'
        import {
            ${this.args.featureClassName}Output as Output,
            ${this.args.featureClassName}OutputSchema as OutputSchema
        } from './output'

        @UseCase({id: '${this.args.featureId}', schema: InputSchema })
        export class ${this.args.featureClassName} implements Feature<Input, Output>  {

            kind: '${this.args.featureId}' = '${this.args.featureId}'

            constructor() {}

            async invoke(value: Input): Promise<Output> {


            }
        }
        `
    }
}
