
export class PluginHookContext<Data extends {} = {}, Meta extends {} = {}> {
    hook: string
    error?: any
    data: Data
    meta: Meta

    constructor(hook: string, data: Data, meta: Meta) {
        this.hook = hook
        this.data = data
        this.meta = meta
    }

    toJSON(): string {
        return JSON.stringify({ hook: this.hook, data: this.data })
    }

    // Update the current instance from a serialized string
    applyDTO(dto: { data: Data }): void {
        this.data = dto.data
    }

}
