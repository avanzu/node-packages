const { promiseErr, promiseOk, panic } = require('./util')
const ERROR = 'Unable to unwrap Result<Err>.'

const Ok = (value) => ({
    isOk: () => true,
    isErr: () => false,
    fold: (_, onOk) => onOk(value),
    map: (fn) => Ok(fn(value)),
    chain: (fn) => fn(value),
    ap: (result) => result.map(value),
    bimap: (_, onOk) => Ok(onOk(value)),
    unwrap: () => value,
    unwrapOrElse: () => value,
    unwrapOr: () => value,
    promise: () => promiseOk(value),
})

const Err = (error = ERROR) => ({
    isOk: () => false,
    isErr: () => true,
    fold: (onErr) => onErr(error),
    map: () => Err(error),
    chain: () => Err(error),
    ap: () => Err(error),
    bimap: (onErr) => Err(onErr(error)),
    unwrap: () => panic(error),
    unwrapOrElse: (fn) => fn(),
    unwrapOr: (value) => value,
    promise: () => promiseErr(error),
})

// prettier-ignore
const tryCatch = (fn) => (...args) => {
    try {
        return Ok(fn(...args))
    } catch (e) {
        return Err(e)
    }
}

const Result = {
    Ok,
    Err,
    of: Ok,
    err: Err,
    try: tryCatch,
    promised: (promise) => promise.then(Ok, Err),
}

module.exports = Result
