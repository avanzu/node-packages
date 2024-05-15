const { promiseOk } = require('./util')
const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom')

export const Identity = (x) => ({
    fold: (fn) => fn(x),
    map: (fn) => Identity(fn(x)),
    tap: (fn) => (fn(x), Identity(x)),
    chain: (fn) => fn(x),
    ap: (id) => id.map(x),
    unwrap: () => x,
    unwrapAlways: (value) => value,
    unwrapWith: (fn) => fn(x),
    promise: () => promiseOk(x),
    and: (id) => id.fold((v) => Identity([x].concat([v]))),
    concat: (id) => id.fold((v) => Identity(x.concat(v))),
    [customInspectSymbol]: () => `Identity(${x})`,
})

Identity.all = (opts) =>
    opts.reduce((acc, cur) => acc.fold((xs) => cur.map((x) => xs.concat([x]))), Identity([]))

Identity.of = Identity

// export const of = Identity
