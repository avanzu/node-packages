import { valueOf } from '../util'
import { Map } from './Collections'
import { JSON, TEXT, XML, ANY, ContentType } from './MediaTypes'
const defaults = () => ({ content: Map(), headers: Map() })
const Schema = (state: any = {}) => ({
    valueOf: () => valueOf(state),
    raw: (raw: any) => Schema({ ...state, ...raw }),
    description: (...description) => Schema({ ...state, description: description.join('\n') }),
    required: () => Schema({ ...state, required: true }),
    header: (name: string, value: any) => Schema({ ...state, headers: state.headers.add(name, value) }),
    json: (content) => Schema({ ...state, content: state.content.add(JSON, content) }),
    text: (content) => Schema({ ...state, content: state.content.add(TEXT, content) }),
    xml: (content) => Schema({ ...state, content: state.content.add(XML, content) }),
    any: (content) => Schema({ ...state, content: state.content.add(ANY, content) }),
    content: (type: ContentType, content: any) => Schema({ ...state, content: state.content.add(type, content) }),
})

export default {
    defaults,
    Schema,
    new: () => Schema(defaults()),
}
