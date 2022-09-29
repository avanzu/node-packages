const { promiseErr, promiseOk, panic } = require('./util')

const ERROR = 'Unable to unwrap Option<None>.'

const Some = (x) => ({
    isNone: () => false,
    isSome: () => true,
    fold: (_, onOk) => onOk(x),
    map: (fn) => Some(fn(x)),
    tap: (fn) => (fn(x), Some(x)),
    chain: (fn) => fn(x),
    ap: (result) => result.map(x),
    bimap: (_, onOk) => Some(onOk(x)),
    inspect: (_, onOk) => (onOk(x), Some(x)),
    unwrap: () => x,
    unwrapOrElse: () => x,
    unwrapOr: () => x,
    unwrapAlways: (value) => value,
    unwrapWith: (fn) => fn(x),
    promise: () => promiseOk(x),
    and: (opt) => opt.fold(None, (v) => Some([x].concat([v]))),
    concat: (opt) =>
        opt.fold(
            () => Some(x),
            (v) => Some(x.concat(v))
        ),
})

const None = () => ({
    isNone: () => true,
    isSome: () => false,
    fold: (onErr) => onErr(),
    inspect: (onErr) => (onErr(), None()),
    map: () => None(),
    chain: () => None(),
    ap: () => None(),
    bimap: (onNone) => (onNone(), None()),
    tap: () => None(),
    unwrap: () => panic(ERROR),
    unwrapOrElse: (fn) => fn(),
    unwrapOr: (value) => value,
    unwrapAlways: (value) => value,
    unwrapWith: (fn) => fn(ERROR),
    promise: () => promiseErr(ERROR),
    and: () => None(),
    concat: (opt) => opt.fold(None, Some),
})

const all = (opts) =>
    opts.reduce((acc, cur) => acc.fold(None, (xs) => cur.map((x) => xs.concat([x]))), Some([]))

const fromNullable = (x) => (x != null ? Some(x) : None())

const Option = {
    Some,
    None,
    of: Some,
    none: None,
    all,
    ERROR,
    fromNullable,
}

module.exports = Option
