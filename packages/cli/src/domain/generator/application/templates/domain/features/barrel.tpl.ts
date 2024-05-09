import { GeneratorContext, GeneratorArguments } from "~/domain/generator/common/context";
import { Template } from "~/domain/generator/common/template";

export class FeaturesBarrel implements Template {
    directory: string = './src/domain/features';
    filename: string = 'index.ts';
    render(context: GeneratorContext<GeneratorArguments>): string | Promise<string> {
        return `
            export * from './demo/demo.feature'
        `
    }

}