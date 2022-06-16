const { mergeRight } = require('ramda')
const { valueOf } = require('../util')

const List = (state = []) => ({
    add: (element) => List([...state, element]),
    merge: (elements) => List(state.concat(elements)),
    valueOf: () => valueOf(state),
})

const Map = (state = {}) => ({
    add: (name, value) => Map({ ...state, [name]: value }),
    merge: (entries) => Map(mergeRight(state, entries)),
    valueOf: () => valueOf(state),
})

exports.List = List
exports.Map = Map
