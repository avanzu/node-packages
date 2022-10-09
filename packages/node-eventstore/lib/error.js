class StoreError extends Error {
    constructor(message, data) {
        super(message)
        this.data = data
    }
    static new(message, data) {
        return new StoreError(message, data)
    }
}

const Messages = {
    NO_STORE: 'eventstore not injected!',
    NO_STREAM: 'eventstream not injected!',
    NO_EVENT: 'event not injected!',
    NO_QUERY: 'query not injected!',
    NO_AGGREGATEID: 'missing property "aggregateId"',
    NO_UNCOMMITTED: 'eventstream.uncommittedEvents not injected!',
    COMMIT_UNCALLABLE: 'eventstore.commit not injected!',
    EVENTS_NO_ARRAY: 'events should be an array!',
    EVENTS_MISSING_REV: 'The events passed should all have a streamRevision!',
}

module.exports = {
    StoreError,
    Messages,
}
