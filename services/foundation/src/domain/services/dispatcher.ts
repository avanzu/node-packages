import { InputType, KindOf, OutputType, Feature } from '../interfaces/foundation'

export class Dispatcher {
    protected useCases: Map<string, Feature<any, any>> = new Map()

    constructor(useCases: Record<string, Feature>) {
        this.add(...Object.values(useCases))
    }

    add(...useCases: Feature[]) {
        for (let useCase of useCases) {
            this.useCases.set(useCase.kind, useCase)
        }
    }

    list(): Record<string, Feature> {
        return Object.fromEntries(this.useCases.entries())
    }

    protected exists<U extends Feature>(id: KindOf<U>): boolean {
        return this.useCases.has(id)
    }

    protected get<U extends Feature>(id: KindOf<U>): U {
        let useCase = this.useCases.get(id)
        if (this.guard<U>(useCase, id)) {
            return useCase
        }
        throw new Error()
    }

    protected guard<U extends Feature>(val: Feature | null | undefined, id: string): val is U {
        if (null == val) return false
        return 'kind' in val && val.kind === id
    }

    async dispatch<U extends Feature = Feature>(
        id: KindOf<U>,
        payload: InputType<U>
    ): Promise<OutputType<U>> {
        let useCase = this.get(id)
        let result = await useCase.invoke(payload)

        return result
    }
}
