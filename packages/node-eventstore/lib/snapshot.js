// var debug = require('debug')('@avanzu/eventstore/snapshot')
const { fromNullable } = require('@avanzu/std').Result
/**
 * Snapshot constructor
 * The snapshot object will be persisted to the store.
 * @param {String} id  the id of the snapshot
 * @param {Object} obj the snapshot object infos
 * @constructor
 */
class Snapshot {
    constructor(id, obj) {
        fromNullable(id, 'id not injected!')
            .chain(() => fromNullable(obj, 'object not injected!'))
            .chain(() => fromNullable(obj.aggregateId, 'object.aggregateId not injected!'))
            .chain(() => fromNullable(obj.data, 'object.data not injected!'))
            .unwrap()

        this.id = id
        this.streamId = obj.aggregateId
        this.aggregateId = obj.aggregateId
        this.aggregate = obj.aggregate || null
        this.context = obj.context || null
        this.commitStamp = null
        this.revision = obj.revision
        this.version = obj.version
        this.data = obj.data
    }

    commitNow() {
        this.commitStamp = new Date()
        return this
    }
}
module.exports = Snapshot
