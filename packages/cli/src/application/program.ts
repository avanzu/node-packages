import { Command } from 'commander'
import { CliCommand } from './command'
import { CommandGroup } from './commandGroup'
import { EnvironmentCommnads } from './environment'
import { GenerateCommandGroup } from './generate'

export class Program {
    private program: Command
    constructor(private name: string, private version: string, private description?: string) {
        this.program = this.createProgram()
        for(let item of this.commands()) {
            item.register(this.program)
        }

    }

    private commands() : (CommandGroup|CliCommand)[] {
        return [
            new EnvironmentCommnads(this.program),
            new GenerateCommandGroup(this.program)
        ]
    }

    private createProgram() {
        return new Command().name(this.name).description(this.description).version(this.version)
    }

    execute() {
        this.program.parse()
    }
}