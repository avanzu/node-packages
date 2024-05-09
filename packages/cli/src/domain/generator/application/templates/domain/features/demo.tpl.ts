import { GeneratorContext, GeneratorArguments } from "~/domain/generator/common/context";
import { Template } from "~/domain/generator/common/template";

export class DemoFeature implements Template {
    directory: string = './src/domain/features/demo';
    filename: string = 'demo.feature.ts';
    async render(context: GeneratorContext<GeneratorArguments>): Promise<string> {
        return `
        import { UseCase } from '@avanzu/kernel'
        import { CurrentUser, Feature } from '~/domain/interfaces'

        @UseCase('foo')
        export class DemoFeature implements Feature {
        kind: 'demo' = 'demo'

        async invoke(value: any): Promise<any> {
            return this.kind
        }
        }

        `
    }

}