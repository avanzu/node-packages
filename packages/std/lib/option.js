const { promiseErr, promiseOk, panic } = require('./util')
const ERROR = 'Unable to unwrap Option<None>.'

const Some = (value) => ({
    isNone: () => false,
    isSome: () => true,
    fold: (_, onOk) => onOk(value),
    map: (fn) => Some(fn(value)),
    chain: (fn) => fn(value),
    ap: (result) => result.map(value),
    bimap: (_, onOk) => Some(onOk(value)),
    unwrap: () => value,
    unwrapOrElse: () => value,
    unwrapOr: () => value,
    promise: () => promiseOk(value),
})

const None = () => ({
    isNone: () => true,
    isSome: () => false,
    fold: (onErr) => onErr(),
    map: () => None(),
    chain: () => None(),
    ap: () => None(),
    bimap: () => None(),
    unwrap: () => panic(ERROR),
    unwrapOrElse: (fn) => fn(),
    unwrapOr: (value) => value,
    promise: () => promiseErr(ERROR),
})

const Option = {
    Some,
    None,
    of: Some,
    none: None,
}

module.exports = Option
