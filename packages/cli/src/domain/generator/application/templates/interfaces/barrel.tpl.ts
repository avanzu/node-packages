import { GeneratorContext, GeneratorArguments } from "~/domain/generator/common/context";
import { Template } from "~/domain/generator/common/template";

export class InterfacesBarrel implements Template {
    directory: string = './src/application/interfaces';
    filename: string = 'index.ts';
    async render(context: GeneratorContext<GeneratorArguments>): Promise<string> {
        return `
            export * from './application'
            export * from './configuration'
            export * from './services'
        `
    }

}