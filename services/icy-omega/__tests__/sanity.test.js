'use strict'
const lib = require('../package.json')

describe('cqrs-composable', () => {
    test('sanity', () => {
        expect(lib).toHaveProperty('name', 'icy-omega')
    })
})
