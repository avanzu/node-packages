const Store = require('../../lib/databases/inmemory')

const idle = (time) => new Promise((Ok) => setTimeout(Ok, time))

describe('The inmemory backend', () => {
    const store = new Store({ type: 'inmemory', trackPosition: true })
    describe('connect/disconnect', () => {
        beforeEach(() => jest.clearAllMocks())

        it('should open a connection', async () => {
            const onConnect = jest.fn()
            store.once('connect', onConnect)
            await store.connect()

            expect(onConnect).toHaveBeenCalled()
        })

        it('should close a connection', async () => {
            const onClose = jest.fn()
            store.once('disconnect', onClose)
            await store.connect()
            await idle(100)
            await store.disconnect()

            expect(onClose).toHaveBeenCalled()
        })
    })

    describe('With opened connection', () => {
        beforeAll(() => store.connect())
        beforeEach(() => jest.clearAllMocks())
        afterAll(() => store.disconnect())

        it('should clear all tables', async () => {
            const promise = store.clear()
            await expect(promise).resolves.toEqual(store)
        })

        it('should produce new ids', async () => {
            const promise = store.getNewId()
            await expect(promise).resolves.toMatch(/.+/)
        })

        it('should provide next positions', async () => {
            const promise = store.getNextPositions(2)
            await expect(promise).resolves.toEqual([1, 2])
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

            const promise = store.addEvents([event])

            await expect(promise).resolves.toBe(store)
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

            const promise = store.addEvents([
                { ...event, id: '222', commitId: '112' },
                { ...event, id: '223', commitId: '112' },
            ])

            await expect(promise).resolves.toBe(store)
        })

        it('should provide stored events', async () => {
            const promise = store.getEvents({ aggregateId: 'id1' }, 0, -1)

            await expect(promise).resolves.toHaveLength(3)
        })

        it('should provide stored events since ', async () => {
            const promise = store.getEvents(Date.now(), 0, -1)

            await expect(promise).resolves.toHaveLength(3)
        })

        it('should provide events by revision', async () => {
            const promise = store.getEventsByRevision({ aggregateId: 'id1' }, 0, -1)
            await expect(promise).resolves.toHaveLength(3)
        })

        it('should provide undispatched events', async () => {
            const promise = store.getUndispatchedEvents({})
            await expect(promise).resolves.toHaveLength(3)
        })

        it('should mark a single event as undispatched', async () => {
            const promise = store
                .getLastEvent({ aggregateId: 'id1' })
                .then(({ id }) => store.setEventToDispatched(id))

            await expect(promise).resolves.toEqual(store)
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
            const promise = store.addSnapshot(snap1)
            await expect(promise).resolves.toEqual(store)
        })

        it('should retrieve snapshots', async () => {
            const promise = store.getSnapshot(
                {
                    aggregateId: '920193847',
                    aggregate: 'myCoolAggregate',
                    context: 'myCoolContext',
                },
                -1
            )
            await expect(promise).resolves.toMatchObject({ id: 'rev3', aggregateId: '920193847' })
        })

        it('should clean snaphsots', async () => {
            const promise = store.cleanSnapshots({
                aggregateId: '920193847',
                aggregate: 'myCoolAggregate',
                context: 'myCoolContext',
            })
            promise.catch(console.log)
            await expect(promise).resolves.toEqual(1)
        })
    })
})
