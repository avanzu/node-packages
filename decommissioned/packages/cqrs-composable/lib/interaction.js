const { addCommands } = require('./commands')
const { addMutations } = require('./mutations')
const { addState } = require('./state')
const { propOr, pipe, applyTo, forEach } = require('ramda')

exports.addInteraction = (interaction) => {
    forEach(applyTo(interaction), [
        pipe(propOr({}, 'commands'), addCommands),
        pipe(propOr({}, 'mutations'), addMutations),
        pipe(propOr({}, 'state'), addState),
    ])
}
