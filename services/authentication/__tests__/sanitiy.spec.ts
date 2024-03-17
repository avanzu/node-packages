import {name} from '~/src'
describe('Sanity check', () => {
    test('sanity', () => {
        expect(name).toEqual('authentication')
    })
})