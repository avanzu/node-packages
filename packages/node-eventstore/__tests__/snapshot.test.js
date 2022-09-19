const Snapshot = require('../lib/snapshot')

describe('Snapshot', () => {
    describe('creating an instance', () => {
        describe('without passing an id', () => {
            it('it should throw an error', () => {
                expect(() => {
                    new Snapshot()
                }).toThrowError(/id/)
            })
        })

        describe('without passing an object', () => {
            it('it should throw an error', () => {
                expect(() => {
                    new Snapshot('myId', {})
                }).toThrowError(/object/)
            })
        })

        describe('without passing an aggregateId in the object', () => {
            it('it should throw an error', () => {
                expect(() => {
                    new Snapshot('myId', {})
                }).toThrowError(/object.aggregateId/)
            })
        })

        describe('without passing a data property in the object', () => {
            it('it should throw an error', () => {
                expect(() => {
                    new Snapshot('myId', { aggregateId: 'myAggId' })
                }).toThrowError(/object.data/)
            })
        })

        describe('passing all needed values', () => {
            it('it should return a valid object', () => {
                var snap = null

                expect(() => {
                    snap = new Snapshot('myId', { aggregateId: 'myAggId', data: 'snap' })
                }).not.toThrowError()

                expect(snap.id).toEqual('myId')
                expect(snap.aggregateId).toEqual('myAggId')
                expect(snap.streamId).toEqual('myAggId')
                expect(snap.data).toEqual('snap')
            })
        })

        describe('passing all values', () => {
            it('it should return a valid object', () => {
                var snap = null

                expect(() => {
                    snap = new Snapshot('myId', {
                        aggregateId: 'myAggId',
                        aggregate: 'myAgg',
                        context: 'myCont',
                        data: 'snap',
                        version: 3,
                        revision: 24,
                    })
                }).not.toThrowError()

                expect(snap.id).toEqual('myId')
                expect(snap.aggregateId).toEqual('myAggId')
                expect(snap.streamId).toEqual('myAggId')
                expect(snap.aggregate).toEqual('myAgg')
                expect(snap.context).toEqual('myCont')
                expect(snap.data).toEqual('snap')
                expect(snap.version).toEqual(3)
                expect(snap.revision).toEqual(24)
            })
        })
    })
})
