const makeDebug = require('debug')
const { tap, pipe, concat } = require('ramda')
const makeInspect = (debug) => ({
    debug,
    inspect: (message) => tap((data) => debug(message, data)),
    notice: (message) => tap(() => debug(message)),
})

module.exports = pipe(concat('@avanzu/rhea-composable/'), makeDebug, makeInspect)
