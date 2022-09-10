const { addMutations, addState } = require('../..')
module.exports = () => {
    addState({ aThing: 0 })
    addState({ anotherThing: 0 })

    addMutations({
        DidAThing: (state, aThing) => ({ ...state, aThing }),
        DidAnotherThing: (state, anotherThing) => ({ ...state, anotherThing }),
    })
}
