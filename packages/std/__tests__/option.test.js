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

        test('unwrapAlways', () => expect(val.unwrapAlways('const')).toBe('const'))

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
        test('tap', () => {
            const fn = jest.fn()
            expect(val.tap(fn).unwrap()).toBe('something')
            expect(fn).toHaveBeenCalledWith('something')
        })
        test('inspect', () => {
            const onSome = jest.fn(),
                onNone = jest.fn()
            expect(val.inspect(onNone, onSome).unwrap()).toBe('something')
            expect(onSome).toHaveBeenCalledWith('something')
            expect(onNone).not.toHaveBeenCalled()
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
        test('unwrapAlways', () => expect(val.unwrapAlways('const')).toBe('const'))

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
            expect(onErr).toHaveBeenCalled()
        })
        test('promise', async () => {
            await expect(val.promise()).rejects.toBeInstanceOf(Error)
        })
        test('tap', () => {
            const fn = jest.fn()
            expect(val.tap(fn).isNone()).toBe(true)
            expect(fn).not.toHaveBeenCalled()
        })
        test('inspect', () => {
            const onSome = jest.fn(),
                onNone = jest.fn()
            expect(() => val.inspect(onNone, onSome).unwrap()).toThrow(Option.ERROR)
            expect(onSome).not.toHaveBeenCalled()
            expect(onNone).toHaveBeenCalled()
        })
    })

    describe('boolean combining', () => {
        test('Some and Some -> Some', () => {
            const result = Option.Some('value 1').and(Option.Some('value 2'))
            expect(result.isSome()).toBe(true)
            expect(result.unwrap()).toEqual(['value 1', 'value 2'])
        })
        test('Some and None -> None', () => {
            const result = Option.Some('value 1').and(Option.None())
            expect(result.isNone()).toBe(true)
        })
        test('None and Nome -> None', () => {
            const result = Option.None().and(Option.Some('value 1'))
            expect(result.isNone()).toBe(true)
        })

        test('All (Some) -> Some', () => {
            const result = Option.all([
                Option.Some('value1'),
                Option.Some('value2'),
                Option.Some('value3'),
                Option.Some('value4'),
            ])

            expect(result.isSome()).toBe(true)
            expect(result.unwrap()).toEqual(['value1', 'value2', 'value3', 'value4'])
        })

        test('All (None) -> None', () => {
            const result = Option.all([Option.None(), Option.None(), Option.None()])
            expect(result.isNone()).toBe(true)
        })

        test('Some, Some and None -> None', () => {
            const result = Option.all([Option.Some('val1'), Option.Some('val2'), Option.None()])
            expect(result.isNone()).toBe(true)
        })

        test('None, Some and Some -> None', () => {
            const result = Option.all([Option.None(), Option.Some('val1'), Option.Some('val2')])
            expect(result.isNone()).toBe(true)
        })
    })

    describe('Semigroup', () => {
        test('Some(a) concat Some(b) -> Some(c)', () => {
            const result = Option.Some('Foo').concat(Option.Some('Bar'))
            expect(result.unwrap()).toEqual('FooBar')
        })
        test('Some(a) concat None -> Some(a)', () => {
            const result = Option.Some('Foo').concat(Option.None())
            expect(result.unwrap()).toEqual('Foo')
        })

        test('None concat Some(a) -> Some(a)', () => {
            const result = Option.None().concat(Option.Some('Foo'))
            expect(result.unwrap()).toEqual('Foo')
        })
    })
})
