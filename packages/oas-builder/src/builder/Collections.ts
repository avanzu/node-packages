import { mergeRight } from 'ramda'
import { valueOf } from '../util'

export const List = (state = []) => ({
    add: (element: any) => List([...state, element]),
    merge: (elements: any) => List(state.concat(elements)),
    valueOf: () => valueOf(state),
})

export const Map = (state = {}) => ({
    add: (name: string, value: any) => Map({ ...state, [name]: value }),
    merge: (entries: any) => Map(mergeRight(state, entries)),
    valueOf: () => valueOf(state),
})

export default { List, Map }