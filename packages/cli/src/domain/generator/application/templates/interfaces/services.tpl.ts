import { GeneratorContext, GeneratorArguments } from "~/domain/generator/common/context";
import { Template } from "~/domain/generator/common/template";

export class ServicesInterface implements Template {
    directory: string = './src/application/interfaces';
    filename: string = 'services.ts';
    async render(context: GeneratorContext<GeneratorArguments>): Promise<string> {

        return `
            import type { AppService } from "../services/appService"

            export type Services = {
                appService: AppService
            }
        `

    }

}