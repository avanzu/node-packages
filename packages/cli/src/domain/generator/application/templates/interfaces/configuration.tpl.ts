import { GeneratorContext, GeneratorArguments } from "~/domain/generator/common/context";
import { Template } from "~/domain/generator/common/template";

export class ConfigurationInterface implements Template {
    directory: string  ='./src/application/interfaces';
    filename: string = 'configuration.ts';
    async render(context: GeneratorContext<GeneratorArguments>): Promise<string> {
        return `
            import { LoggerOptions } from "pino"

            export type ConfigValues = {
                host: string
                port: number
                logger: LoggerOptions
            }
        `
    }

}