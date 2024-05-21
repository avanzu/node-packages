class CQRSError extends Error {
    constructor(code, name, message) {
        super(message)
        this.code = code
        this.name = name
    }
    static new(code, name, message) {
        return new CQRSError(code, name, message)
    }
}
exports.CQRSError = CQRSError
// exports.notImplemented = (message) => CQRSError.new(501, 'NotImplemented', message)
exports.notFound = (message) => CQRSError.new(404, 'NotFound', message)
