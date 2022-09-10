const init = require('./init')

const { memoryState, memoryStream, useStore, useEntity, useDispatch } = require('..')
const EventEmitter = require('events')
const { CQRSError } = require('../lib/errors')

describe('Store', () => {
    beforeAll(() => init())

    describe('with state based crud', () => {
        const app = new EventEmitter()
        const { loadEntity, saveEntity, removeEntity } = useStore(app, memoryState)

        test('storing entities', async () => {
            const { generate } = useEntity()
            const { dispatch } = useDispatch({})
            const entity = await generate()
                .then(dispatch('DoAThing', { amount: 3 }))
                .then(dispatch('DoAnotherThing', { amount: 5 }))
                .then(saveEntity)
                .then(dispatch('DoAThing', { amount: 9 }))
                .then(saveEntity)

            const state = await memoryState.load(entity.id)

            expect(entity).toHaveProperty('state', {
                id: expect.any(String),
                aThing: 12,
                anotherThing: 5,
            })
            expect(entity).toHaveProperty('events', [])

            expect(state).toEqual({
                id: entity.id,
                state: entity.state,
                revision: 2,
                events: [],
            })
        })

        test('loading entities', async () => {
            memoryState.save({
                id: 'entity-999',
                state: { aThing: 10, anotherThing: 99 },
                events: [],
                revision: 99,
            })

            const entity = await loadEntity('entity-999')
            expect(entity).toHaveProperty('state', {
                id: 'entity-999',
                aThing: 10,
                anotherThing: 99,
            })
        })

        test('removing entities', async () => {
            memoryState.save('entity-999', { aThing: 10, anotherThing: 99 }, [])

            const entity = await loadEntity('entity-999')
            await expect(removeEntity(entity)).resolves.toEqual(entity)
            expect(memoryState.exists(entity.id)).toEqual(false)
        })

        test('loading non existent entites', async () => {
            const promise = loadEntity('not-present')
            await expect(promise).rejects.toBeInstanceOf(CQRSError)
        })
    })

    describe('with stream based crud', () => {
        const app = new EventEmitter()
        const { loadEntity, saveEntity, removeEntity } = useStore(app, memoryStream)

        test('storing entities', async () => {
            const { generate } = useEntity()
            const { dispatch } = useDispatch({})
            const entity = await generate()
                .then(dispatch('DoAThing', { amount: 3 }))
                .then(dispatch('DoAnotherThing', { amount: 5 }))
                .then(saveEntity)
                .then(dispatch('DoAThing', { amount: 9 }))
                .then(saveEntity)

            const stream = await memoryStream.load(entity.id)

            expect(entity).toHaveProperty('state', {
                id: expect.any(String),
                aThing: 12,
                anotherThing: 5,
            })
            expect(entity).toHaveProperty('events', [])

            expect(stream).toEqual({
                id: entity.id,
                state: {},
                events: [
                    { eventType: 'DidAThing', data: 3 },
                    { eventType: 'DidAnotherThing', data: 5 },
                    { eventType: 'DidAThing', data: 12 },
                ],
                revision: 3,
            })
        })

        test('loading entities', async () => {
            memoryStream.save({
                id: 'entity-999',
                state: {},
                events: [{ eventType: 'DidAThing', data: 10 }],
            })

            const entity = await loadEntity('entity-999')
            expect(entity).toHaveProperty('state', {
                id: 'entity-999',
                aThing: 10,
                anotherThing: 0,
            })
        })

        test('removing entities', async () => {
            memoryStream.save({ id: 'entity-999', state: {}, events: [] })

            const entity = await loadEntity('entity-999')
            await expect(removeEntity(entity)).resolves.toEqual(entity)
            expect(memoryStream.exists(entity.id)).toEqual(false)
        })

        test('loading non existent entites', async () => {
            const promise = loadEntity('not-present')
            await expect(promise).rejects.toBeInstanceOf(CQRSError)
        })
    })
})
