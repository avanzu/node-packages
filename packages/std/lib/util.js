const throwable = (e) => (e instanceof Error ? e : new Error(e))

exports.panic = (e) => {
    throw throwable(e)
}

exports.promiseOk = (x) => Promise.resolve(x)
exports.promiseErr = (e) => Promise.reject(throwable(e))
