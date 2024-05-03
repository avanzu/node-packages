import { GeneratorContext, GeneratorArguments } from "../../common/context";
import { Template } from "../../common/template";

export class ControllerBarrel implements Template {
    directory: string = './src/application/controllers';
    filename: string = 'index.ts';
    async render(context: GeneratorContext<GeneratorArguments>): Promise<string> {
        return `
        export * from './appController'

        `
    }

}