const Store = require('../lib/base')
const Base = require('../lib/base')

describe('The store base class', () => {
    const store = new Base()
    const notImplemented = new Error('Please implement this function!')

    it.each([
        ['connect', () => store.connect()],
        ['disconnect', () => store.disconnect()],
        ['getEvents', () => store.getEvents()],
        ['getEventsSince', () => store.getEventsSince()],
        ['getEventsByRevision', () => store.getEventsByRevision()],
        ['addSnapshot', () => store.addSnapshot()],
        ['getSnapshot', () => store.getSnapshot()],
        ['addEvents', () => store.addEvents()],
        ['getLastEvent', () => store.getLastEvent()],
        ['getUndispatchedEvents', () => store.getUndispatchedEvents()],
        ['setEventToDispatched', () => store.setEventToDispatched()],
        ['clear', () => store.clear()],
    ])('should panic on calling "%s"', async (_, callable) => {
        await expect(callable()).rejects.toEqual(notImplemented)
    })

    it.each([['cleanSnapshots', () => store.cleanSnapshots()]])(
        'should warn but resolve calling "%s"',
        async (_, callable) => {
            await expect(callable()).resolves.toBeUndefined()
        }
    )

    it('should provide a default id generator', async () => {
        await expect(store.getNewId()).resolves.toEqual(expect.any(String))
    })

    it('should provide a default for getNextPositions', async () => {
        await expect(store.getNextPositions()).resolves.toBeNull()
    })

    it('should require the given library', () => {
        expect(Store.use('../__tests__/__init__/usable')).toEqual({ usable: true })
    })
})
