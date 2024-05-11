import { Argument, Option } from 'commander'
import { CliCommand } from '~/application/command'

import { spawn } from 'node:child_process'
import chalk from 'chalk'
import { formatISO } from 'date-fns'
import { FeatureBundle } from '~/domain/generator/feature/featureBundle'
import { FeatureArgs } from '~/domain/generator/feature/templates/barrel.tpl'

type GenerateFeatureOptions = {
    id?: string
    className?: string
    dryRun?: boolean
}

export class GenerateFeature extends CliCommand<GenerateFeatureOptions> {
    name: string = 'feature'

    arguments(): Argument[] {
        return [new Argument('<featureName>', 'The feature name')]
    }

    options(): Option[] {
        return [
            new Option('--id <featureId>', 'The feature id'),
            new Option('--class-name <featureClassName>', 'The feature class name'),
            new Option('--dry-run', 'just output config')
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

    async execute(options: GenerateFeatureOptions, featureName: string): Promise<void> {


        let args: FeatureArgs = {
            featureName,
            featureId: options.id || featureName.toLowerCase().replace(/\s/g, ''),
            featureClassName: options.className || featureName,
        }


        console.group(chalk.green('Generating feature'))
        console.log('Feature name:', chalk.bold.cyan(args.featureName))
        console.log('Feature ID:', chalk.bold.cyan(args.featureId))
        console.log('Feature ClassName:', chalk.bold.cyan(args.featureClassName))

        console.groupEnd()

        if(true === options.dryRun) return

        let bundle = new FeatureBundle({ ...args, cwd: process.cwd() })

        this.inform('Generating files')
        await bundle.generate()
    }
}
