import { Argument, Option } from "commander";
import { CliCommand } from "~/application/command";
import { ApplicationBundle } from "~/domain/generator/application/applicationBundle";

type GenerateApplicationOptions = {
    author?: string
    description?: string
    license?: string
    port?: number
    host?: string
    logLevel?: string
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
            new Option('--license <license>', 'The license'),
            new Option('--port <port>', 'The port number').default(9001),
            new Option('--log-level <level>', 'The default log level'),
            new Option('--host <host>', 'the hostname')
        ]
    }

    async execute(options: GenerateApplicationOptions, packageName: string): Promise<void> {
        let bundle = new ApplicationBundle({
            cwd: process.cwd(),
            packageName,
            author: options.author,
            description: options.description,
            license: options.license,
            port: options.port,
            host: options.host,
            logLevel: options.logLevel
        })

        await bundle.generate()
    }

}