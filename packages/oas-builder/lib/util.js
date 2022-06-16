const { map, when, has, filter, pipe, isNil, isEmpty, complement, allPass } = require('ramda')
const isNotEmpty = complement(isEmpty)
const isNotNil = complement(isNil)
const onlyValues = filter(allPass([isNotEmpty, isNotNil]))

const toValue = when(has('valueOf'), (x) => x.valueOf())
const valueOf = pipe(map(toValue), onlyValues)
const valuesOf = map(valueOf)

exports.toValue = toValue
exports.valueOf = valueOf
exports.valuesOf = valuesOf
