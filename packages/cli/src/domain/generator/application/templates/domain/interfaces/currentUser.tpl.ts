import { GeneratorContext, GeneratorArguments } from "~/domain/generator/common/context";
import { Template } from "~/domain/generator/common/template";

export class CurrentUser implements Template {
    directory: string = './src/domain/interfaces';
    filename: string = 'currentUser.ts';
    async render(context: GeneratorContext<GeneratorArguments>): Promise<string> {
        return `
            export interface CurrentUser {

            }

        `
    }

}