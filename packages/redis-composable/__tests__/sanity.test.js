'use strict'
const lib = require('../package.json')

describe('rhea-composable', () => {
    test('sanity', () => {
        expect(lib).toHaveProperty('name', '@avanzu/redis-composable')
    })
})
