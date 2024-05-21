const { useEntity, addState } = require('..')

describe('Entity', () => {
    addState({ stuffDone: false })
    addState({ foo: 'bar' })

    test('Synchronous', () => {
        const { create } = useEntity()

        const entity = create({ snapshot: 1 })

        expect(entity).toHaveProperty('id', expect.any(String))
        expect(entity).toHaveProperty('events', [])
        expect(entity).toHaveProperty('state', {
            id: expect.any(String),
            stuffDone: false,
            snapshot: 1,
            foo: 'bar',
        })
    })

    test('asynchronous', async () => {
        const { generate } = useEntity()

        const entity = await generate({ id: 'foo-bar' })

        expect(entity).toHaveProperty('state', {
            id: 'foo-bar',
            stuffDone: false,
            foo: 'bar',
        })
    })
})
