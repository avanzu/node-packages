import { Identity } from '~/src'

describe('Type "Identity"', () => {
    const val = Identity.of('something')

    test('unwrap', () => expect(val.unwrap()).toBe('something'))

    test('unwrapAlways', () => expect(val.unwrapAlways('const')).toBe('const'))
    test('unwrapWith', () => {
        const fn = jest.fn(() => 'OK')
        expect(val.unwrapWith(fn)).toBe('OK')
        expect(fn).toHaveBeenCalledWith('something')
    })

    test('fold', () => {
        const onOk = jest.fn().mockReturnValue('onOk')

        const result = val.fold(onOk)
        expect(onOk).toHaveBeenCalledWith('something')
        expect(result).toBe('onOk')
    })

    test('map', () => {
        const mapping = jest.fn().mockReturnValue('mapped')
        const result = val.map(mapping)

        expect(result.unwrap()).toBe('mapped')
        expect(mapping).toHaveBeenCalledWith('something')
    })

    test('chain', () => {
        const result = val.chain((value) => Identity.of(`${value} chained`))
        expect(result.unwrap()).toBe('something chained')
    })
    test('ap', () => {
        const result = Identity.of((value) => `${value} applied`).ap(val)
        expect(result.unwrap()).toBe('something applied')
    })

    test('promise', async () => {
        await expect(val.promise()).resolves.toBe('something')
    })
    test('tap', () => {
        const fn = jest.fn()
        expect(val.tap(fn).unwrap()).toBe('something')
        expect(fn).toHaveBeenCalledWith('something')
    })

    describe('boolean combining', () => {
        test('Identity and Identity -> Identity', () => {
            const result = Identity.of('value 1').and(Identity.of('value 2'))
            expect(result.unwrap()).toEqual(['value 1', 'value 2'])
        })

        test('All (Some) -> Some', () => {
            const result = Identity.all([
                Identity.of('value1'),
                Identity.of('value2'),
                Identity.of('value3'),
                Identity.of('value4'),
            ])

            expect(result.unwrap()).toEqual(['value1', 'value2', 'value3', 'value4'])
        })
    })

    describe('Semigroup', () => {
        test('Identity(a) concat Identity(b) -> Identity(c)', () => {
            const result = Identity.of('Foo').concat(Identity.of('Bar'))
            expect(result.unwrap()).toEqual('FooBar')
        })
    })
})
