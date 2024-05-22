import { valueOf } from '../util'
import { Map } from './Collections'
import { TExample } from './Example'

const defaults = () => ({ examples: Map() })
const addExample = (acc, [name, value]) => acc.add(name, value)
const examplesOf = (examples, state) => Object.entries(examples).reduce(addExample, state.examples)

export type TContent = {
    valueOf: () => any,
    raw: (raw) => TContent,
    schema: (schema?:any) => TContent,
    example: (example: TExample | any) => TContent,
    addExample: (name: string, example: TExample) => TContent,
    examples: (examples: TExample[]) => TContent,

}

const Schema = (state: any = {}) => ({
    valueOf: () => valueOf(state),
    raw: (raw) => Schema({ ...state, ...raw }),
    schema: (schema?:any) => Schema({ ...state, schema }),
    example: (example: TExample | any) => Schema({ ...state, example }),
    addExample: (name: string, example: TExample) => Schema({ ...state, examples: addExample(state.examples, [name, example]) }),
    examples: (examples: TExample[]) => Schema({ ...state, examples: examplesOf(examples, state) }),
})


export default {
    defaults,
    Schema,
    new: (): TContent => Schema(defaults())
}
