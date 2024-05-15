# `@avanzu/std`

A rust inspired implementation of the [`Option`](https://docs.rs/rustc-std-workspace-std/latest/std/option/index.html) and [`Result`](https://docs.rs/rustc-std-workspace-std/latest/std/result/index.html) type with some additional functional flavor.

## Usage

In genereal

-   the `Option` type can be used for values that may be `null` or `undefined`.
-   the `Result` type can be used to express the outcome of a **_synchronous_** computation.

## `Option`

The abstract `Option` type contains two concrete types that share an identical api.

-   `Some<T>` - the type that contains a concrete value
-   `None` - the type that contains nothing

Adapting the corresponding rust example function

```js
const { Option } = require('@avanzu/std')

const divide = (numerator, denominator) =>
    denominator == 0 ? Option.None() : Option.Some(numerator / denominator)
```

The return value of the function is an option.

```js
let result = divide(2.0, 3.0)
```

### `Option.fold(onNone, onSome)`

Since javascript does not provide anything similar to rusts pattern matching, we need a different way to make sure that every branch is covered.

```js
result.fold(
    // the "None" branch must be handled
    () => console.error('Cannot divide by 0'),
    // before you can handle the "Some" branch
    (x) => console.log('Result: ', x)
)
```

Releasing the value out of the `Option` type works also quite similar.

### `Option.unwrap()`

`Some` will return the wrapped value

```js
Option.Some('FOO').unwrap()
// -> 'FOO'
```

`None` will "panic" and throw an exception

```js
Option.None().unwrap()
// -> Error('Unable to unwrap Option<None>.')
```

### `Option.unwrapOr(defalut)`

`Some` will return the wrapped value

```js
Option.Some('FOO').unwrap()
// -> 'FOO'
```

`None` will return the given `default` value

```js
Option.None().unwrapOr('BAR')
// -> 'BAR'
```

### `Option.unwrapOrElse(callable)`

`Some` will return the wrapped value

```js
Option.Some('FOO').unwrap()
// -> 'FOO'
```

`None` will return the value from the given `callable`

```js
Option.None().unwrapOrElse(() => 'BAZ')
// -> 'BAZ'
```

## `Result`

The abstract `Result` type contains two concrete types that share an identical api.

-   `Ok<T>` - the type that contains the value of a successful computation
-   `Err<U>` - the type that contains the error of a failed computation

It behaves very similar to the `Option` type with the only difference that the `Err` branch can also hold a value which is typically an `Error`.

Adapting the corresponding rust example function

```js
const { Result } = require('@avanzu/std')
const Version = {
    Version1: 'Version1',
    Version2: 'Version2',
}

const parseVersion = ([num] = []) => {
    switch (num) {
        case undefined:
            return Result.Err('invalid header length')
        case 1:
            return Result.Ok(Version.Version1)
        case 2:
            return Result.Ok(Version.Version2)
        default:
            return Result.Err('invalid version')
    }
}
```

The return value of the function is a result.

```js
let result = parseVersion([2])
```

### `Result.fold(onErr, onOk)`

Similar to the `Option` type, we can use `fold` to exhaust all branches.

```js
result.fold(
    // the "Err" branch must be handled
    (e) => console.error('error parsing header', e),
    // before you can handle the "Ok" branch
    (x) => console.log('working with version: ', x)
)
```

Releasing the value out of the `Result` type works also quite similar.

### `Result.unwrap()`

`Ok` will return the wrapped value

```js
Result.Ok('FOO').unwrap()
// -> 'FOO'
```

`Err` will "panic" and throw an exception

```js
Result.Err('Does not compute.').unwrap()
// -> Error('Does not compute.')
```

### `Result.unwrapOr(defalut)`

`Ok` will return the wrapped value

```js
Result.Ok('FOO').unwrap()
// -> 'FOO'
```

`Err` will return the given `default` value

```js
Result.Err('Does not compute.').unwrapOr('BAR')
// -> 'BAR'
```

### `Result.unwrapOrElse(callable)`

`Ok` will return the wrapped value

```js
Result.Ok('FOO').unwrap()
// -> 'FOO'
```

`Err` will return the value from the given `callable`

```js
Result.Err('Does not compute.').unwrapOrElse(() => 'BAZ')
// -> 'BAZ'
```

### `Result.try(unsafeFunction)`

You can use `Result.try` to wrap an "unsafe" function that may throw an exception.

```js
const parse = Result.try(JSON.parse)
```

With valid json, parse will return `Ok<T>` which you can `unwrap`.

```js
parse('{"foo": "bar"}').unwrapOr({})
// { foo: 'bar' }
```

With invalid json, parse will return `Err<U>` which you can ignore and return a default value.

```js
parse('{"foo": "bar"').unwrapOr({})
// -> {}
```

## Promises

Both types provide a `.promise()` method that allows to transform seamlessly into a promise.

-   `Option`

    -   `Some` will transform into a resolved promise
    -   `None` will transform into a rejected promise

-   `Result`
    -   `Ok` will transform into a resolved promise
    -   `Err` will transform into a rejected promise

Transforming from a promise into a result is not that simple due to the synchronous nature of `Result`. However, you can use `await` in parenthesis to make it work.

```js
const p = Promise.resolve('OK')
(await Result.promised(p)).unwrap()
// 'OK'
```

**_important_** in order for this to work, you **have** to use parenthesis. Otherwise `await` will not know where the promise is supposed to end.

```js
await Result.promised(p).unwrap()
// TypeError: Result.promised(...).unwrap is not a function
```

## Functional style

Both `Option` and `Result` provide some functional style methods for you to play with.

> The following examples will only showcase with the `Result` type but the `Option` type behaves identically.

### Functor

> `T(a).map(a -> b) -> T(b)`

You can safely use `.map` without worrying about null or error checks.

```js
Result.Ok('foo')
    .map((s) => s.toUpperCase())
    .unwrapOr('')
// -> 'FOO'
Result.Err()
    .map((s) => s.toUpperCase())
    .unwrapOr('')
// -> ''
```

### Monad

> `T.chain(a -> T(b)) -> T(b)`

You can safely `.chain` Results or Options

```js
Result.Ok('foo')
    .chain((s) => Result.Ok(`${s}bar`))
    .unwrapOr('')
// -> foobar

Result.Ok('foo')
    .chain((s) => Result.Err('Does not compute.'))
    .unwrapOr('')
// -> ''
```

### Applicative

> `T(a -> b).ap(T(a)) -> T(b)`

You can apply a function inside a Result to a value in another Result.

```js
const concat = (a) => (b) => `${a}-${b}`

Result.Ok(concat).ap(Result.Ok('foo')).ap(Result.Ok('bar')).unwrapOr('')
// foo-bar

Result.Ok(concat).ap(Result.Ok('foo')).ap(Result.Err()).unwrapOr('')
// ''
```

### Bifunctor

> `T(a|b).bimap((b -> c), (a -> d)) -> T(d|c)`

You can assign a callback to each branch simultaneously. Similar to `.fold` the first callback is used for the error case and the second one for the success case.

```js
const onErr = (err) => new Error('Changed')
const onOk = (value) => value.toUpperCase()

Result.Ok('foo').bimap(onErr, onOk).fold(console.error, console.log)
// -> 'FOO

Result.Err().bimap(onErr, onOk).fold(console.error, console.log)
// ->  Error: Changed
```

### Semigroup

> `T(a).concat(T(b)) -> T(ab)`

You can `.concat` an arbitrary number of results or options together, provided that the value they are holding is also a semigroup (provides a `.concat` method) like strings or arrays.

#### Result

```js
Result.Ok('foo').concat(Result.Ok('bar')).unwrap()
// -> foobar

Result.Ok([1, 2])
    .concat(Result.Ok([3, 4]))
    .unwrap()
// -> [1,2,3,4]
```

If you do concat with a `Result.Err` the outcome will remain the first one that occurred.

```js
Result.Ok('test')
    .concat(Result.Err('Error1'))
    .concat(Result.Err('Error2'))
    .fold(console.error, console.log)
// -> Error: Error1
```

#### Option

```js
Option.Some('foo').concat(Option.Some('bar')).unwrap()
// -> foobar

Option.Some([1, 2])
    .concat(Option.Some([3, 4]))
    .unwrap()
// -> [1,2,3,4]
```

If you do concat with a `Option.None` the outcome will remain the previous one.

```js
Option.Some('test')
    .concat(Option.None())
    .concat(Option.Some('!!!'))
    .fold(console.error, console.log)
// -> test!!!
```
