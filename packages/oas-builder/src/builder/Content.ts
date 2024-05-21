import { valueOf } from '../util'
import { Map } from './Collections'

const defaults = () => ({ examples: Map() })
const addExample = (acc, [name, value]) => acc.add(name, value)
const examplesOf = (examples, state) => Object.entries(examples).reduce(addExample, state.examples)

const Schema = (state: any = {}) => ({
    valueOf: () => valueOf(state),
    raw: (raw) => Schema({ ...state, ...raw }),
    schema: (schema?:any) => Schema({ ...state, schema }),
    example: (example) => Schema({ ...state, example }),
    addExample: (name, example) =>
        Schema({ ...state, examples: addExample(state.examples, [name, example]) }),
    examples: (examples) => Schema({ ...state, examples: examplesOf(examples, state) }),
})

export default {
    defaults,
    Schema,
    new: () => Schema(defaults())
}
