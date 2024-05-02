import { Command, Argument, Option } from 'commander'
export abstract class CliCommand<Options = unknown> {

    abstract readonly name : string

    abstract execute(options: Options, ...args: unknown[]) : Promise<void>

    arguments() : Argument[] {
        return []
    }
    options() : Option[] {
        return []
    }

    register(program: Command) {
        let command = program.command(this.name)


        for(let argument of this.arguments())
            command.addArgument(argument)

        for (let option of this.options()) {
            command.addOption(option)
        }

        command.action(async (...args: any[]) => {
            let _ = args.pop()
            let options: Options = args.pop()
            await this.execute(options, ...args)
        })
    }
}