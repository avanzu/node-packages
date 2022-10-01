const { Ok, fromPredicate } = require('@avanzu/std').Result
// prettier-ignore
const { always, has, is, identity, filter, isNil, complement, anyPass, isEmpty } = require('ramda')

const noop = identity
const isString = is(String)
const isNothing = anyPass([isNil, isEmpty])
const filterEmpty = filter(complement(isNil))
const noopAsync = () => Promise.resolve()

const toQuery = (aggregateId) => ({ aggregateId })

const normalizeQuery = (query) =>
    fromPredicate(isString, query).bimap(always(query), toQuery).unwrapWith(Ok)

const requireId = (query) =>
    fromPredicate(has('aggregateId'), query).mapErr(
        () => new Error('An aggregateId should be passed!')
    )

const toAggregateQuery = (query) => normalizeQuery(query).unwrapWith(requireId)

module.exports = {
    noop,
    noopAsync,
    toAggregateQuery,
    normalizeQuery,
    requireId,
    filterEmpty,
    isNothing,
}
