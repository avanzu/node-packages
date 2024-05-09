import { GeneratorContext, GeneratorArguments } from "~/domain/generator/common/context";
import { Template } from "~/domain/generator/common/template";

export class DomainInterfacesBarrel implements Template {
    directory: string = './src/domain/interfaces';
    filename: string = 'index.ts';
    async render(context: GeneratorContext<GeneratorArguments>): Promise<string> {
        return `
            export * from './foundation'
            export * from './currentUser'
        `
    }

}