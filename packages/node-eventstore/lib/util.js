const { Ok, fromPredicate } = require('@avanzu/std').Result
const { Messages } = require('./error')
// prettier-ignore
const { always, has, is, identity, filter, isNil, complement, anyPass, isEmpty, equals } = require('ramda')

const noop = identity
const isString = is(String)
const isNoString = complement(isString)
const isFunction = is(Function)
const isNoFunction = complement(isFunction)
const isCallable = (x) => equals('function', typeof x)
const isArray = is(Array)
const isNoArray = complement(isArray)

const isNothing = anyPass([isNil, isEmpty])
const isNotNil = complement(isNil)
const filterEmpty = filter(isNotNil)
const noopAsync = () => Promise.resolve()

const isAggregate = has('aggregateId')
const withAggregate = (aggregateId) => ({ aggregateId })
const normalizeQuery = (q) =>
    fromPredicate(isString, q).bimap(always(q), withAggregate).unwrapWith(Ok)
const requireId = (obj) => fromPredicate(isAggregate, obj).mapErr(() => Messages.NO_AGGREGATEID)
const toAggregateQuery = (q) => normalizeQuery(q).unwrapWith(requireId)

module.exports = {
    noop,
    noopAsync,
    toAggregateQuery,
    normalizeQuery,
    requireId,
    filterEmpty,
    isNothing,
    isNotNil,
    isFunction,
    isArray,
    isString,
    isNoString,
    isNoFunction,
    isNoArray,
    isCallable,
}
