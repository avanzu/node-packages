import { GeneratorContext, GeneratorArguments } from "~/domain/generator/common/context";
import { Template } from "~/domain/generator/common/template";

export class DIBarrel implements Template {
    directory: string = "./src/application/dependencyInjection";
    filename: string = "index.ts";
    async render(context: GeneratorContext<GeneratorArguments>): Promise<string> {
        return `
        export * from './appContainerBuilder'
        `
    }

}