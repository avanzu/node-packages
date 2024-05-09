import { Argument, Option } from 'commander'
import { CliCommand } from '~/application/command'
import { ApplicationBundle } from '~/domain/generator/application/applicationBundle'
import { spawn } from 'node:child_process'
import chalk from 'chalk'
import { formatISO } from 'date-fns'

type GenerateApplicationOptions = {
    author?: string
    description?: string
    license?: string
    port?: number
    host?: string
    logLevel?: string
    install?: boolean
}

export class GenerateApplication extends CliCommand<GenerateApplicationOptions> {
    name: string = 'application'

    arguments(): Argument[] {
        return [new Argument('<packageName>', 'The package name')]
    }

    options(): Option[] {
        return [
            new Option('--author <author>', 'The author'),
            new Option('--description <description>', 'A short description'),
            new Option('--license <license>', 'The license'),
            new Option('--port <port>', 'The port number').default(9001),
            new Option('--log-level <level>', 'The default log level'),
            new Option('--host <host>', 'the hostname'),
            new Option('--install', 'wether to install dependencies after files are generated')
        ]
    }

    protected now() {
        return formatISO(new Date(), { representation: 'complete' })
    }

    protected printBuffer(buffer: Buffer) {
        let lines = buffer.toLocaleString().trim().split('\n')
        for (let line of lines) {
            console.info('[%s] %s', chalk.grey(this.now()), chalk.cyan(line))
        }
    }

    protected inform(message: string) {
        console.info('[%s] %s', chalk.grey(this.now()), chalk.white(message))
    }

    protected async spawnCommand(name: string, args: string[] = []) {
        let cmd = spawn(name, args, { cwd: process.cwd() })
        cmd.stdout.on('data', this.printBuffer.bind(this))

        let exitCode = await new Promise((Ok) => cmd.once('exit', Ok))
        return exitCode
    }

    protected async install() {
        await this.spawnCommand('npm', ['install'])
    }

    protected async update() {
        await this.spawnCommand('npm', ['update'])
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
            logLevel: options.logLevel,
        })

        this.inform('Generating files')
        await bundle.generate()
        // await this.install()
        if(true === options.install) {
            this.inform('Installing dependencies')
            await this.update()
        }
    }
}
