import { mergeRight } from 'ramda'
import { valueOf } from '../util'


export type TList = {
    add: (element: any) => TList,
    merge: (elements: any) => TList,
    valueOf: () => any,

}
export const List = (state = []) : TList => ({
    add: (element: any) => List([...state, element]),
    merge: (elements: any) => List(state.concat(elements)),
    valueOf: () => valueOf(state),
})


export type TMap = {
    add: (name: string, value: any) => TMap,
    merge: (entries: any) => TMap,
    valueOf: () => any,
}

export const Map = (state = {}) : TMap => ({
    add: (name: string, value: any) => Map({ ...state, [name]: value }),
    merge: (entries: any) => Map(mergeRight(state, entries)),
    valueOf: () => valueOf(state),
})


export default { List, Map }