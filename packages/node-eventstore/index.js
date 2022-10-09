const { always, curry } = require('ramda')
const Eventstore = require('./lib/eventstore'),
    Base = require('./lib/base'),
    // _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    { isCallable, isString } = require('./lib/util'),
    { Option, Result } = require('@avanzu/std')

const fileExists = Option.fromNullable(fs.accessSync)
    .map((f) => (s) => Result.tryNow(f, s).isOk())
    .or(Option.fromNullable(fs.existsSync))
    .or(Option.fromNullable(path.existsSync))
    .fold(Result.Err, Result.Ok)

const confirmFileExists = curry((type, toCheck) =>
    fileExists
        .ap(Result.of(toCheck))
        .chain(Result.fromBoolean)
        .bimap(
            always(`Expected implementation for "${type}" in "${toCheck}" which does not exist!`),
            always(toCheck)
        )
)

const tryToRequire = (path) => Result.tryNow(require, path)

const warnOnModuleNotFound = curry((type, { message, code }) => {
    if (code === 'MODULE_NOT_FOUND') {
        const moduleName = message.match(/'([^']+)/).at(1)
        console.warn(
            `Please install module "${moduleName}" to work with db implementation "${type}"!`
        )
    }
})

const requireStore = (type) =>
    Result.Ok(path.join(__dirname, '/lib/databases/', `${type}.js`))
        .chain(confirmFileExists(type))
        .chain(tryToRequire)
        .tapErr(warnOnModuleNotFound(type))
        .unwrap()

const getSpecificStore = (options = {}) => {
    const type = Option.fromNullable(options.type)
        .map((v) => (isString(v) ? v.toLowerCase() : v))
        .unwrapOr('inmemory')

    return Result.fromBoolean(isCallable(type))
        .map(always(type))
        .unwrapOrElse(() => requireStore(type))
}

module.exports = (options = {}) =>
    Result.tryNow(getSpecificStore, options)
        .map((Store) => new Eventstore(options, new Store(options)))
        .unwrap()

module.exports.Store = Base
