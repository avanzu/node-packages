'use strict'
import lib from '../package.json'

describe('rhea-composable', () => {
    test('sanity', () => {
        expect(lib).toHaveProperty('name', '@avanzu/oas-builder')
    })
})
