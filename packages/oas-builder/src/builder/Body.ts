import { valueOf } from '../util'
import { Map } from './Collections'
import { TContent } from './Content'
import { THeader } from './Header'
import { JSON, TEXT, XML, ANY, ContentType } from './MediaTypes'
const defaults = () => ({ content: Map(), headers: Map() })

export type TBody = {
    valueOf: () => any,
    raw: (raw: any) => TBody,
    description: (...description: string[]) => TBody,
    required: () => TBody,
    header: (name: string, value: THeader) => TBody,
    json: (content: TContent) => TBody,
    text: (content: TContent) => TBody,
    xml: (content: TContent) => TBody,
    any: (content: TContent) => TBody,
    content: (type: ContentType, content: TContent) => TBody,
}

const Schema = (state: any = {}) : TBody => ({
    valueOf: () => valueOf(state),
    raw: (raw: any) => Schema({ ...state, ...raw }),
    description: (...description: string[]) => Schema({ ...state, description: description.join('\n') }),
    required: () => Schema({ ...state, required: true }),
    header: (name: string, value: THeader) => Schema({ ...state, headers: state.headers.add(name, value) }),
    json: (content: TContent) => Schema({ ...state, content: state.content.add(JSON, content) }),
    text: (content: TContent) => Schema({ ...state, content: state.content.add(TEXT, content) }),
    xml: (content: TContent) => Schema({ ...state, content: state.content.add(XML, content) }),
    any: (content: TContent) => Schema({ ...state, content: state.content.add(ANY, content) }),
    content: (type: ContentType, content: TContent) => Schema({ ...state, content: state.content.add(type, content) }),
})

export default {
    defaults,
    Schema,
    new: ():TBody => Schema(defaults()),
}
