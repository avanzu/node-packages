import { map, when, has, filter, pipe, isNil, isEmpty, complement, allPass } from 'ramda'
const isNotEmpty = complement(isEmpty)
const isNotNil = complement(isNil)
const onlyValues = filter(allPass([isNotEmpty, isNotNil]))

export const toValue = when(has('valueOf'), (x) => x.valueOf())
export const valueOf = pipe(map(toValue), onlyValues)
export const valuesOf = map(valueOf)
