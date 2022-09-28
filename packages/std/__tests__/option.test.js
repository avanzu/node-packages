const { Option } = require('..')
describe('Type "Option"', () => {
    describe('factories', () => {
        test('Some', () => {
            expect(Option.Some(1).isSome()).toBe(true)
        })
        test('None', () => {
            expect(Option.None().isNone()).toBe(true)
        })
        test('of', () => {
            expect(Option.of(1).isSome()).toBe(true)
        })
        test('none', () => {
            expect(Option.none().isNone()).toBe(true)
        })
    })

    describe('Variant "Some"', () => {
        const val = Option.of('something')

        test('isSome', () => expect(val.isSome()).toBe(true))
        test('isNone', () => expect(val.isNone()).toBe(false))

        test('unwrap', () => expect(val.unwrap()).toBe('something'))
        test('unwrapOr', () => expect(val.unwrapOr('foo')).toBe('something'))
        test('unwrapOrElse', () => {
            expect(val.unwrapOrElse(() => 'something else')).toBe('something')
        })

        test('fold', () => {
            const onOk = jest.fn().mockReturnValue('onOk')
            const onErr = jest.fn().mockReturnValue('onErr')
            const result = val.fold(onErr, onOk)
            expect(onOk).toHaveBeenCalledWith('something')
            expect(onErr).not.toHaveBeenCalled()
            expect(result).toBe('onOk')
        })

        test('map', () => {
            const mapping = jest.fn().mockReturnValue('mapped')
            const result = val.map(mapping)

            expect(result.isSome()).toBe(true)
            expect(result.unwrap()).toBe('mapped')
            expect(mapping).toHaveBeenCalledWith('something')
        })

        test('chain', () => {
            const result = val.chain((value) => Option.Some(`${value} chained`))
            expect(result.unwrap()).toBe('something chained')
        })
        test('ap', () => {
            const result = Option.of((value) => `${value} applied`).ap(val)
            expect(result.unwrap()).toBe('something applied')
        })

        test('bimap', () => {
            const onOk = jest.fn().mockReturnValue('onOk')
            const onErr = jest.fn().mockReturnValue('onErr')
            const result = val.bimap(onErr, onOk)

            expect(result.unwrap()).toBe('onOk')
        })
        test('promise', async () => {
            await expect(val.promise()).resolves.toBe('something')
        })
    })

    describe('Variant "None"', () => {
        const val = Option.none()

        test('isSome', () => expect(val.isSome()).toBe(false))
        test('isNone', () => expect(val.isNone()).toBe(true))
        test('unwrap', () => expect(() => val.unwrap()).toThrow())

        test('unwrapOr', () => expect(val.unwrapOr('foo')).toBe('foo'))
        test('unwrapOrElse', () => {
            expect(val.unwrapOrElse(() => 'something else')).toBe('something else')
        })

        test('fold', () => {
            const onOk = jest.fn().mockReturnValue('onOk')
            const onErr = jest.fn().mockReturnValue('onErr')
            const result = val.fold(onErr, onOk)

            expect(result).toBe('onErr')
            expect(onOk).not.toHaveBeenCalled()
            expect(onErr).toHaveBeenCalled()
        })

        test('map', () => {
            const mapping = jest.fn().mockReturnValue('mapped')
            const result = val.map(mapping)

            expect(result.isNone()).toBe(true)
            expect(() => result.unwrap()).toThrow()
            expect(mapping).not.toHaveBeenCalled()
        })

        test('chain', () => {
            const result = val.chain((value) => Option.Some(`${value} chained`))
            expect(() => result.unwrap()).toThrow()
        })
        test('ap', () => {
            const fn = jest.fn().mockReturnValue('should not be called')
            expect(() => val.ap(Option.of(fn)).unwrap()).toThrow()
            expect(fn).not.toHaveBeenCalled()
        })

        test('bimap', () => {
            const onOk = jest.fn().mockReturnValue('onOk')
            const onErr = jest.fn().mockReturnValue('onErr')
            const result = val.bimap(onErr, onOk)

            expect(() => result.unwrap()).toThrow()
            expect(onOk).not.toHaveBeenCalled()
            expect(onErr).not.toHaveBeenCalled()
        })
        test('promise', async () => {
            await expect(val.promise()).rejects.toBeInstanceOf(Error)
        })
    })
})
