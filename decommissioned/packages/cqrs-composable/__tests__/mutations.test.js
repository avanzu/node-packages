const { addMutation, mutate } = require('..')
describe('mutations', () => {
    addMutation('StuffHappened', (state, data) => ({ ...state, ...data }))

    test('Mutation exists', () => {
        const result = mutate(
            { bar: 'baz' },
            { eventType: 'StuffHappened', data: { foo: 'bar' } },
            {}
        )
        expect(result).toEqual({ bar: 'baz', foo: 'bar' })
    })

    test('Mutation does not exist', () => {
        const result = mutate(
            { bar: 'baz' },
            { eventType: 'NothingHappened', data: { foo: 'bar' } },
            {}
        )
        expect(result).toEqual({ bar: 'baz' })
    })
})
