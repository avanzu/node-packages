const { Ok, fromPredicate } = require('@avanzu/std').Result
const { always, has, is, identity } = require('ramda')

const noop = identity
const isString = is(String)
const toQuery = (aggregateId) => ({ aggregateId })

const normalizeQuery = (query) =>
    fromPredicate(isString, query).bimap(always(query), toQuery).unwrapWith(Ok)

const requireId = (query) =>
    fromPredicate(has('aggregateId'), query).mapErr(
        () => new Error('An aggregateId should be passed!')
    )

const toAggregateQuery = (query) => normalizeQuery(query).unwrapWith(requireId)

module.exports = { noop, toAggregateQuery, normalizeQuery, requireId }
