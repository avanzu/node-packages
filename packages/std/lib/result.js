const { promiseErr, promiseOk, panic } = require('./util')
const ERROR = 'Unable to unwrap Result<Err>.'

const Ok = (x) => ({
    isOk: () => true,
    isErr: () => false,
    fold: (_, onOk) => onOk(x),
    map: (fn) => Ok(fn(x)),
    mapErr: () => Ok(x),
    tap: (fn) => (fn(x), Ok(x)),
    tapErr: () => Ok(x),
    chain: (fn) => fn(x),
    ap: (result) => result.map(x),
    bimap: (_, onOk) => Ok(onOk(x)),
    inspect: (_, onOk) => (onOk(x), Ok(x)),
    swap: () => Err(x),
    unwrap: () => x,
    unwrapOrElse: () => x,
    unwrapOr: () => x,
    unwrapAlways: (value) => value,
    unwrapWith: (fn) => fn(x),
    promise: () => promiseOk(x),
    and: (res) => res.fold(Err, (v) => Ok([x].concat([v]))),
    concat: (res) => res.fold(Err, (v) => Ok(x.concat(v))),
})

const Err = (e = ERROR) => ({
    isOk: () => false,
    isErr: () => true,
    fold: (onErr) => onErr(e),
    map: () => Err(e),
    mapErr: (fn) => Err(fn(e)),
    tap: () => Err(e),
    tapErr: (fn) => (fn(e), Err(e)),
    chain: () => Err(e),
    ap: () => Err(e),
    bimap: (onErr) => Err(onErr(e)),
    inspect: (onErr) => (onErr(e), Err(e)),
    swap: () => Ok(e),
    unwrap: () => panic(e),
    unwrapOrElse: (fn) => fn(),
    unwrapOr: (value) => value,
    unwrapAlways: (value) => value,
    unwrapWith: (fn) => fn(e),
    promise: () => promiseErr(e),
    and: () => Err(e),
    concat: () => Err(e),
})

// prettier-ignore
const tryCatch = (fn) => (...args) => {
    try { return Ok(fn(...args)) } 
    catch (e) { return Err(e) }
}

const all = (results) =>
    results.reduce((acc, cur) => acc.fold(Err, (xs) => cur.map((x) => xs.concat([x]))), Ok([]))

const fromPredicate = (pred, x) => (pred(x) ? Ok(x) : Err(x))
const fromNullable = (x, message) => (x != null ? Ok(x) : Err(message))
const fromBoolean = (x, message) => (Boolean(x) ? Ok(x) : Err(message))
const promised = (p) => p.then(Ok, Err)

const Result = {
    Ok,
    Err,
    of: Ok,
    err: Err,
    try: tryCatch,
    promised,
    all,
    ERROR,
    fromPredicate,
    fromNullable,
    fromBoolean,
}

module.exports = Result
