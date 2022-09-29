const { toAggregateQuery, normalizeQuery } = require('../lib/util')
describe('toAggregateQuery', () => {
    it('should transform a string to a query object', () => {
        const result = toAggregateQuery('foobar').unwrap()
        expect(result).toEqual({ aggregateId: 'foobar' })
    })
    it('should verify that the given query contains an aggregate id', () => {
        const result = toAggregateQuery({ aggregateId: 'foobar' }).unwrap()
        expect(result).toEqual({ aggregateId: 'foobar' })
    })
    it('should not modify other datatypes', () => {
        expect(normalizeQuery(null).unwrap()).toBe(null)
        expect(normalizeQuery(12345).unwrap()).toBe(12345)
    })
})
