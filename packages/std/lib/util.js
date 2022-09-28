const throwable = (message) => (message instanceof Error ? message : new Error(message))

exports.panic = (error) => {
    throw throwable(error)
}

exports.promiseOk = (value) => Promise.resolve(value)
exports.promiseErr = (err) => Promise.reject(throwable(err))
