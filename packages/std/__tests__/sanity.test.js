'use strict'
const lib = require('../package.json')

describe('std library', () => {
    test('sanity', () => {
        expect(lib).toHaveProperty('name', '@avanzu/std')
    })
})
