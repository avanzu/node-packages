import  { Doc }  from '~/builder'

describe('Doc', () => {
    test('Structure', () => {
        expect(Doc.new()).toBeDefined()
        expect(Doc.new().valueOf()).toHaveProperty('openapi', '3.0.0')
    })
})
