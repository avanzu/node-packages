import { GeneratorContext } from "./context"

export interface Template {

    directory: string
    filename: string

    render(context: GeneratorContext) : Promise<string>
}

