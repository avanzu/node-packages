import { Argument, Option } from "commander";
import { CliCommand } from "~/application/command";
import { ApplicationBundle } from "~/domain/generator/application/applicationBundle";

type GenerateApplicationOptions = {
    author?: string
    description?: string
    license?: string
}

export class GenerateApplication extends CliCommand<GenerateApplicationOptions> {
    name: string = 'application';

    arguments(): Argument[] {
        return [
            new Argument('<packageName>', 'The package name')
        ]
    }

    options(): Option[] {
        return [
            new Option('--author <author>', 'The author'),
            new Option('--description <description>', 'A short description'),
            new Option('--license <license>', 'The license')
        ]
    }

    async execute(options: GenerateApplicationOptions, packageName: string): Promise<void> {
        let bundle = new ApplicationBundle({
            cwd: process.cwd(),
            packageName,
            author: options.author,
            description: options.description,
            license: options.license
        })

        await bundle.generate()
    }

}