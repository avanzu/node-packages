import { Command } from 'commander'
import { CliCommand } from './command'
export abstract class CommandGroup {

    abstract readonly groupName: string
    protected group?: Command

    constructor(protected parent: Command) {
    }

    get groupKey() {
        return this.groupName
    }

    private createGroup() {
        if(false === Boolean(this.group))
            this.group = this.parent.command(this.groupKey)
    }

    register() {
        this.createGroup()
        for (let command of this.commands()) {
            command.register(this.group)
        }
    }

    abstract commands(): CliCommand[]
}
