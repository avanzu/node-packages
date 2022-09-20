const Store = require('../../lib/databases/inmemory')

const idle = (time) => new Promise((Ok) => setTimeout(Ok, time))

describe('The inmemory backend', () => {
    const store = new Store({ type: 'inmemory', trackPosition: true })
    describe('connect/disconnect', () => {
        beforeEach(() => jest.clearAllMocks())

        it('should open a connection', async () => {
            const onConnect = jest.fn()
            const callback = jest.fn()
            store.once('connect', onConnect)
            await store.connect(callback)

            expect(onConnect).toHaveBeenCalled()
            expect(callback).toHaveBeenCalled()
        })

        it('should close a connection', async () => {
            const onClose = jest.fn()
            const callback = jest.fn()
            store.once('disconnect', onClose)
            await store.connect()
            await idle(100)
            await store.disconnect(callback)

            expect(onClose).toHaveBeenCalled()
            expect(callback).toHaveBeenCalled()
        })
    })

    describe('With opened connection', () => {
        beforeAll(() => store.connect())
        beforeEach(() => jest.clearAllMocks())
        afterAll(() => store.disconnect())

        it('should clear all tables', async () => {
            const callback = jest.fn()
            const promise = store.clear(callback)
            await expect(promise).resolves.toEqual(store)
        })

        it('should produce new ids', async () => {
            const callback = jest.fn()
            const promise = store.getNewId(callback)
            await expect(promise).resolves.toMatch(/.+/)
            expect(callback).toHaveBeenCalled()
        })

        it('should provide next positions', async () => {
            const callback = jest.fn()
            const promise = store.getNextPositions(2, callback)
            await expect(promise).resolves.toEqual([1, 2])
            expect(callback).toHaveBeenCalled()
        })

        it('should add one event', async () => {
            const event = {
                aggregateId: 'id1',
                id: '111',
                streamRevision: 0,
                commitId: '111',
                commitStamp: new Date(),
                commitSequence: 0,
                payload: {
                    event: 'bla',
                },
                applyMappings: () => {},
            }

            const callback = jest.fn()
            const promise = store.addEvents([event], callback)

            await expect(promise).resolves.toBe(store)
            expect(callback).toHaveBeenCalled()
        })

        it('should add multiple event', async () => {
            const event = {
                aggregateId: 'id1',
                id: '111',
                streamRevision: 0,
                commitId: '111',
                commitStamp: new Date(),
                commitSequence: 0,
                payload: {
                    event: 'bla',
                },
                applyMappings: () => {},
            }

            const callback = jest.fn()
            const promise = store.addEvents(
                [
                    { ...event, id: '222', commitId: '112' },
                    { ...event, id: '223', commitId: '112' },
                ],
                callback
            )

            await expect(promise).resolves.toBe(store)
            expect(callback).toHaveBeenCalled()
        })

        it('should provide stored events', async () => {
            const callback = jest.fn()
            const promise = store.getEvents({ aggregateId: 'id1' }, 0, -1, callback)

            await expect(promise).resolves.toHaveLength(3)
            expect(callback).toHaveBeenCalled()
        })

        it('should provide stored events since ', async () => {
            const callback = jest.fn()
            const promise = store.getEvents(Date.now(), 0, -1, callback)

            await expect(promise).resolves.toHaveLength(3)
            expect(callback).toHaveBeenCalled()
        })

        it('should provide events by revision', async () => {
            const callback = jest.fn()
            const promise = store.getEventsByRevision({ aggregateId: 'id1' }, 0, -1, callback)
            await expect(promise).resolves.toHaveLength(3)
            expect(callback).toHaveBeenCalled()
        })

        it('should provide undispatched events', async () => {
            const callback = jest.fn()
            const promise = store.getUndispatchedEvents({}, callback)
            await expect(promise).resolves.toHaveLength(3)
            expect(callback).toHaveBeenCalled()
        })

        it('should mark a single event as undispatched', async () => {
            const callback = jest.fn()
            const promise = store
                .getLastEvent({ aggregateId: 'id1' })
                .then(({ id }) => store.setEventToDispatched(id, callback))

            promise.catch(console.log)

            await expect(promise).resolves.toMatchObject({ ok: 1 })

            expect(callback).toHaveBeenCalled()
        })

        it('should add snapshots', async () => {
            var snap1 = {
                id: 'rev3',
                aggregateId: '920193847',
                aggregate: 'myCoolAggregate',
                context: 'myCoolContext',
                commitStamp: new Date(Date.now() + 405),
                revision: 3,
                version: 1,
                data: {
                    mySnappi: 'data',
                },
            }
            const callback = jest.fn()
            const promise = store.addSnapshot(snap1, callback)
            await expect(promise).resolves.toMatchObject({ ok: 1 })
            expect(callback).toHaveBeenCalled()
        })

        it('should retrieve snapshots', async () => {
            const callback = jest.fn()
            const promise = store.getSnapshot(
                {
                    aggregateId: '920193847',
                    aggregate: 'myCoolAggregate',
                    context: 'myCoolContext',
                },
                -1,
                callback
            )
            await expect(promise).resolves.toMatchObject({ id: 'rev3', aggregateId: '920193847' })
            expect(callback).toHaveBeenCalled()
        })

        it('should clean snaphsots', async () => {
            const callback = jest.fn()
            const promise = store.cleanSnapshots(
                {
                    aggregateId: '920193847',
                    aggregate: 'myCoolAggregate',
                    context: 'myCoolContext',
                },
                callback
            )
            promise.catch(console.log)
            await expect(promise).resolves.toEqual(0)
            expect(callback).toHaveBeenCalled()
        })
    })
})
