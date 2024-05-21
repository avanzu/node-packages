const { addCommand, addMutations, useDispatch, useEntity } = require('..')
const { CQRSError } = require('../lib/errors')

describe('Composing', () => {
    const ctx = { context: true }

    const execute = jest.fn().mockImplementation(({ commit }, data, context) => {
        expect(context).toBe(ctx)
        commit('StuffDone', data)
    })

    const StuffDone = jest.fn().mockImplementation((state, data, context) => {
        expect(context).toBe(ctx)
        return { ...state, ...data }
    })

    addCommand({ name: 'DoStuff', execute })
    addMutations({ StuffDone })

    beforeEach(() => jest.clearAllMocks())

    test('Dispatching commands', async () => {
        const { generate } = useEntity()
        const { dispatch } = useDispatch(ctx)

        const entity = await generate({ id: 'foo-bar' })
            .then(dispatch('DoStuff', { stuffDone: true, foo: 'bar' }))
            .then(dispatch('DoStuff', { secondPass: true }))

        expect(entity).toHaveProperty('events', [
            { eventType: 'StuffDone', data: { stuffDone: true, foo: 'bar' } },
            { eventType: 'StuffDone', data: { secondPass: true } },
        ])

        expect(entity).toHaveProperty('state', {
            id: 'foo-bar',
            stuffDone: true,
            secondPass: true,
            foo: 'bar',
        })
    })

    test('DispatchMap', async () => {
        const { generate } = useEntity()
        const { dispatchMap } = useDispatch(ctx)

        const mapFn = jest.fn().mockResolvedValue({ bar: 'baz' })
        const entity = await generate({ id: 'foo-bar', foo: 'bar' }).then(
            dispatchMap('DoStuff', mapFn)
        )

        expect(entity).toHaveProperty('state', { id: 'foo-bar', foo: 'bar', bar: 'baz' })
        expect(mapFn).toHaveBeenCalledWith({ id: 'foo-bar', foo: 'bar' })
    })

    test('DispatchOn', async () => {
        const { create } = useEntity()
        const { dispatchOn } = useDispatch(ctx)
        const entity = await dispatchOn(create(), 'DoStuff', { dispatched: true })
        expect(entity).toHaveProperty('state', {
            id: expect.any(String),
            dispatched: true,
        })
    })

    test('Command not found', async () => {
        const { generate } = useEntity()
        const { dispatch } = useDispatch(ctx)

        const promise = generate({ id: 'foo-bar' })
            .then(dispatch('DoStuff', {}))
            .then(dispatch('NoOp'))

        await expect(promise).rejects.toBeInstanceOf(CQRSError)
    })
})
