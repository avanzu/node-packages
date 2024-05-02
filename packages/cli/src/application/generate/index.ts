import { CliCommand } from "~/application/command";
import { CommandGroup } from "~/application/commandGroup";
import { GenerateApplication } from "./application";

export class GenerateCommandGroup extends CommandGroup {

    groupName = 'generate'

    commands(): CliCommand<unknown>[] {
        return [
            new GenerateApplication()
        ]
    }

}