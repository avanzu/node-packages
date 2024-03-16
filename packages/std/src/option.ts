const { promiseErr, promiseOk, panic } = require('./util')
const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom')

export const ERROR = 'Unable to unwrap Option<None>.'

export const Some = (x) => ({
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
    unwrapOrElse: (_) => x,
    unwrapOr: (_) => x,
    unwrapAlways: (value) => value,
    unwrapWith: (fn) => fn(x),
    promise: () => promiseOk(x),
    and: (opt) => opt.fold(None, (v) => Some([x].concat([v]))),
    or: (val) => Some(x),
    concat: (opt) =>
        opt.fold(
            () => Some(x),
            (v) => Some(x.concat(v))
        ),
    [customInspectSymbol]: () => `Some(${x})`,
})

export const None = () => ({
    isNone: () => true,
    isSome: () => false,
    fold: (onErr, _) => onErr(),
    inspect: (onErr, onOk) => (onErr(), None()),
    map: (fn) => None(),
    chain: (fn) => None(),
    ap: (option) => None(),
    bimap: (onNone, onSome) => (onNone(), None()),
    tap: (fn) => None(),
    unwrap: () => panic(ERROR),
    unwrapOrElse: (fn) => fn(),
    unwrapOr: (value) => value,
    unwrapAlways: (value) => value,
    unwrapWith: (fn) => fn(ERROR),
    promise: () => promiseErr(ERROR),
    and: (option) => None(),
    or: (opt) => opt.fold(None, Some),
    concat: (opt) => opt.fold(None, Some),
    [customInspectSymbol]: () => `None()`,
})

export const all = (opts) =>
    opts.reduce((acc, cur) => acc.fold(None, (xs) => cur.map((x) => xs.concat([x]))), Some([]))

export const Option = {
    fromNullable: (x?) => (x != null ? Some(x) : None()),
    of: Some,
    none: None,
    all: (opts) =>
        opts.reduce((acc, cur) => acc.fold(None, (xs) => cur.map((x) => xs.concat([x]))), Some([])),
    Some,
    None,
    ERROR,
}
// export const of = Some
// export const none = None

/*
const Option = {
    Some,
    None,
    of: Some,
    none: None,
    all,
    ERROR,
    fromNullable,
    customInspectSymbol
}

module.exports = Option
*/
