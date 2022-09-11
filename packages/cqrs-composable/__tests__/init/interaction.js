exports.state = {
    aThing: 0,
    anotherThing: 0,
}

exports.commands = {
    DoAThing: {
        name: 'DoAThing',
        execute: ({ state, commit }, data) => {
            commit('DidAThing', state.aThing + data.amount)
        },
    },
    DoAnotherThing: {
        name: 'DoAnotherThing',
        execute: ({ state, commit }, data) => {
            commit('DidAnotherThing', state.anotherThing + data.amount)
        },
    },
}

exports.mutations = {
    DidAThing: (state, aThing) => ({ ...state, aThing }),
    DidAnotherThing: (state, anotherThing) => ({ ...state, anotherThing }),
}
