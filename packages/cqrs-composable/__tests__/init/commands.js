const { addCommand } = require('../..')
module.exports = () => {
    addCommand({
        name: 'DoAThing',
        execute: ({ state, commit }, data) => {
            commit('DidAThing', state.aThing + data.amount)
        },
    })
    addCommand({
        name: 'DoAnotherThing',
        execute: ({ state, commit }, data) => {
            commit('DidAnotherThing', state.anotherThing + data.amount)
        },
    })
}
