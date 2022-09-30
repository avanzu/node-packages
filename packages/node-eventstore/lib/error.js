class StoreError extends Error {
    constructor(message, data) {
        super(message)
        this.data = data
    }
    static new(message, data) {
        return new StoreError(message, data)
    }
}

module.exports = StoreError
