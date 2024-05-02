import { Argument, Option } from 'commander'
import { CliCommand } from '~/application/command'
import chalk from 'chalk'

type Options = {
    foo: string
}

export class ShowCommand extends CliCommand<Options> {

    static readonly ALL = 'all'

    readonly name: string = 'show';

    arguments(): Argument[] {

        return [
            new Argument('[key]', 'the key to look for').default(ShowCommand.ALL)
        ]

    }

    options() : Option[] {
        return [
            new Option('-f, --foo <value>', 'the foo value')
        ]
    }

    async execute(options: Options, name: string): Promise<void> {

        let pattern = name === ShowCommand.ALL ? new RegExp(/.+/, 'ig') : new RegExp(name, 'ig')
        for(let [name, value] of Object.entries(process.env)) {
            if(pattern.test(name)) {
                console.log(`%s: %s`, chalk.green(name), chalk.bold.blue(value))
            }
        }

    }
}
