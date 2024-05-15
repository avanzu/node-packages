const { promiseErr, promiseOk, panic } = require('./util')
const ERROR = 'Unable to unwrap Result<Err>.'
const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom')

export const Ok = (x) => ({
    isOk: () => true,
    isErr: () => false,
    fold: (_, onOk) => onOk(x),
    map: (fn) => Ok(fn(x)),
    mapErr: (_) => Ok(x),
    tap: (fn) => (fn(x), Ok(x)),
    tapErr: () => Ok(x),
    chain: (fn) => fn(x),
    ap: (result) => result.map(x),
    bimap: (_, onOk) => Ok(onOk(x)),
    inspect: (_, onOk) => (onOk(x), Ok(x)),
    swap: () => Err(x),
    unwrap: (_?) => x,
    unwrapOrElse: (_) => x,
    unwrapOr: (_) => x,
    unwrapAlways: (value) => value,
    unwrapWith: (fn) => fn(x),
    promise: () => promiseOk(x),
    and: (res) => res.fold(Err, (v) => Ok([x].concat([v]))),
    concat: (res) => res.fold(Err, (v) => Ok(x.concat(v))),
    [customInspectSymbol]: () => `Ok(${x})`,
})

export const Err = (e: string | unknown = ERROR) => ({
    isOk: () => false,
    isErr: () => true,
    fold: (onErr, _) => onErr(e),
    map: (_) => Err(e),
    mapErr: (fn) => Err(fn(e)),
    tap: (_) => Err(e),
    tapErr: (fn) => (fn(e), Err(e)),
    chain: (_) => Err(e),
    ap: (_) => Err(e),
    bimap: (onErr, _) => Err(onErr(e)),
    inspect: (onErr, _) => (onErr(e), Err(e)),
    swap: () => Ok(e),
    unwrap: () => panic(e),
    unwrapOrElse: (fn) => fn(),
    unwrapOr: (value) => value,
    unwrapAlways: (value) => value,
    unwrapWith: (fn) => fn(e),
    promise: () => promiseErr(e),
    and: (_) => Err(e),
    concat: (_) => Err(e),
    [customInspectSymbol]: () => `Err(${e})`,
})

const tryCatch =
    (fn) =>
    (...args) => {
        try {
            return Ok(fn(...args))
        } catch (e) {
            return Err(e)
        }
    }

export const Result = {
    all: (results) =>
        results.reduce((acc, cur) => acc.fold(Err, (xs) => cur.map((x) => xs.concat([x]))), Ok([])),
    fromPredicate: (pred, x) => (pred(x) ? Ok(x) : Err(x)),
    fromNullable: (x?, message?) => (x != null ? Ok(x) : Err(message)),
    fromBoolean: (x?, message?) => (Boolean(x) ? Ok(x) : Err(message)),
    promised: (p) => p.then(Ok, Err),
    of: Ok,
    err: Err,
    Ok: Ok,
    Err: Err,
    try: tryCatch,
    tryCatch,
    tryAsync:
        (fn) =>
        async (...args) => {
            try {
                return Ok(await fn(...args))
            } catch (e) {
                return Err(e)
            }
        },
    tryNow: (fn, ...args) => {
        try {
            return Ok(fn(...args))
        } catch (e) {
            return Err(e)
        }
    },
    ERROR,
}

/*
const Result = {
    Ok,
    Err,
    of: Ok,
    err: Err,
    try: tryCatch,
    tryNow,
    tryAsync,
    promised,
    all,
    ERROR,
    fromPredicate,
    fromNullable,
    fromBoolean,
}

module.exports = Result
*/
