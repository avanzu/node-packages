import { CliCommand } from '~/application/command'
import { CommandGroup } from '~/application/commandGroup'
import { ShowCommand } from './show'

export class EnvironmentCommnads extends CommandGroup {
    groupName: string = 'environment'

    commands(): CliCommand[] {
        return [
            new ShowCommand()
        ]
    }





}