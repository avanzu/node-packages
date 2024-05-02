export interface GeneratorArguments {
    cwd: string
}

export type GeneratorContext<Args extends GeneratorArguments = GeneratorArguments> = {
    [P in keyof Args]: Args[P]
}
