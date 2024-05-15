import { Result } from '~/src'

describe('Type "Result"', () => {
    describe('factories', () => {
        test('Ok', () => {
            expect(Result.Ok(1).isOk()).toBe(true)
        })
        test('Err', () => {
            expect(Result.Err().isErr()).toBe(true)
        })
        test('of', () => {
            expect(Result.of(1).isOk()).toBe(true)
        })
        test('err', () => {
            expect(Result.err().isErr()).toBe(true)
        })
        test('err (string)', () => {
            const messge = 'a simple string'
            expect(() => Result.err(messge).unwrap()).toThrow(new Error(messge))
        })
        test('err (Error)', () => {
            const message = new Error('An actual error')
            expect(() => Result.err(message).unwrap()).toThrow(message)
        })

        test('fromNullable(null)', () => expect(Result.fromNullable(null).isErr()).toBe(true))
        test('fromNullable(undefined)', () => expect(Result.fromNullable().isErr()).toBe(true))
        test('fromNullable(value)', () => expect(Result.fromNullable('foo').isOk()).toBe(true))

        test('fromPredicate (true)', () => {
            const predicate = jest.fn(() => true)
            expect(Result.fromPredicate(predicate, 'foo').isOk()).toBe(true)
            expect(predicate).toHaveBeenCalledWith('foo')
        })
        test('fromPredicate (false)', () => {
            const predicate = jest.fn(() => false)
            expect(Result.fromPredicate(predicate, 'foo').isErr()).toBe(true)
            expect(predicate).toHaveBeenCalledWith('foo')
        })

        test('Result.try (Err)', () => {
            const unsafe = jest.fn().mockImplementation(() => {
                throw new Error('SOxNUZyscb')
            })

            const safe = Result.try(unsafe)
            expect(safe('a', 'b', 'c').isErr()).toBe(true)
            expect(unsafe).toHaveBeenCalledWith('a', 'b', 'c')
        })

        test('Result.try (OK)', () => {
            const unsafe = jest.fn().mockReturnValue('WNmjhmrQcW')
            const safe = Result.try(unsafe)

            expect(safe('a', 'b', 'c').isOk()).toBe(true)
            expect(unsafe).toHaveBeenCalledWith('a', 'b', 'c')
        })
    })

    describe('Variant "Ok"', () => {
        const val = Result.of('something')

        test('isOk', () => expect(val.isOk()).toBe(true))
        test('isErr', () => expect(val.isErr()).toBe(false))

        test('unwrap', () => expect(val.unwrap()).toBe('something'))
        test('unwrapOr', () => expect(val.unwrapOr('foo')).toBe('something'))
        test('unwrapOrElse', () => {
            expect(val.unwrapOrElse(() => 'something else')).toBe('something')
        })
        test('unwrapAlways', () => expect(val.unwrapAlways('const')).toBe('const'))
        test('unwrapWith', () => {
            const fn = jest.fn(() => 'OK')
            expect(val.unwrapWith(fn)).toBe('OK')
            expect(fn).toHaveBeenCalledWith('something')
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

            expect(result.isOk()).toBe(true)
            expect(result.unwrap()).toBe('mapped')
            expect(mapping).toHaveBeenCalledWith('something')
        })
        test('mapErr', () => {
            const mapping = jest.fn().mockReturnValue('mapped')
            const result = val.mapErr(mapping)

            expect(result.isOk()).toBe(true)
            expect(result.unwrap()).toBe('something')
            expect(mapping).not.toHaveBeenCalled()
        })

        test('chain', () => {
            const result = val.chain((value) => Result.Ok(`${value} chained`))
            expect(result.unwrap()).toBe('something chained')
        })
        test('ap', () => {
            const result = Result.of((value) => `${value} applied`).ap(val)
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

    describe('Variant "Err"', () => {
        const val = Result.err()

        test('isOk', () => expect(val.isOk()).toBe(false))
        test('isErr', () => expect(val.isErr()).toBe(true))
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

            expect(result.isErr()).toBe(true)
            expect(() => result.unwrap()).toThrow()
            expect(mapping).not.toHaveBeenCalled()
        })

        test('mapErr', () => {
            const mapping = jest.fn().mockReturnValue('mapped')
            const result = val.mapErr(mapping)

            expect(result.isErr()).toBe(true)
            expect(() => result.unwrap()).toThrow('mapped')
            expect(mapping).toHaveBeenCalledWith(Result.ERROR)
        })

        test('chain', () => {
            const result = val.chain((value) => Result.Ok(`${value} chained`))
            expect(() => result.unwrap()).toThrow()
        })
        test('ap', () => {
            const fn = jest.fn().mockReturnValue('should not be called')
            expect(() => val.ap(Result.of(fn)).unwrap()).toThrow()
            expect(fn).not.toHaveBeenCalled()
        })

        test('bimap', () => {
            const onOk = jest.fn().mockReturnValue('onOk')
            const onErr = jest.fn().mockReturnValue('onErr')
            const result = val.bimap(onErr, onOk)

            expect(() => result.unwrap()).toThrow(new Error('onErr'))
            expect(onOk).not.toHaveBeenCalled()
            expect(onErr).toHaveBeenCalled()
        })
        test('promise', async () => {
            await expect(val.promise()).rejects.toBeInstanceOf(Error)
        })
        test('tap', () => {
            const fn = jest.fn()
            expect(val.tap(fn).isErr()).toBe(true)
            expect(fn).not.toHaveBeenCalled()
        })
        test('inspect', () => {
            const onOk = jest.fn(),
                onErr = jest.fn()
            expect(() => val.inspect(onErr, onOk).unwrap()).toThrow(Result.ERROR)
            expect(onOk).not.toHaveBeenCalled()
            expect(onErr).toHaveBeenCalledWith(Result.ERROR)
        })
    })

    describe('Promises', () => {
        test('Promise.resolve', async () => {
            const good = Promise.resolve('OK')
            const result = await Result.promised(good)

            expect(result.unwrap()).toBe('OK')
        })

        test('Promise.reject', async () => {
            const bad = Promise.reject('ERR')
            const result = await Result.promised(bad)

            expect(() => result.unwrap()).toThrow(new Error('ERR'))
        })

        test('Result.tryAsync (OK)', async () => {
            const safe = Result.tryAsync(() => Promise.resolve('OK'))
            expect((await safe('foo')).unwrap()).toBe('OK')
        })
        test('Result.tryAsync (Err)', async () => {
            const safe = Result.tryAsync(() => Promise.reject('Err'))
            const result = await safe('foo')
            expect(() => result.unwrap()).toThrow('Err')
        })
    })
    describe('boolean combining', () => {
        test('Ok and Ok -> Ok', () => {
            const result = Result.Ok('value 1').and(Result.Ok('value 2'))
            expect(result.isOk()).toBe(true)
            expect(result.unwrap()).toEqual(['value 1', 'value 2'])
        })
        test('Ok and Err -> Err', () => {
            const result = Result.Ok('value 1').and(Result.Err())
            expect(result.isErr()).toBe(true)
        })
        test('Err and Nome -> Err', () => {
            const result = Result.Err().and(Result.Ok('value 1'))
            expect(result.isErr()).toBe(true)
        })

        test('All (Ok) -> Ok', () => {
            const result = Result.all([
                Result.Ok('value1'),
                Result.Ok('value2'),
                Result.Ok('value3'),
                Result.Ok('value4'),
            ])

            expect(result.isOk()).toBe(true)
            expect(result.unwrap()).toEqual(['value1', 'value2', 'value3', 'value4'])
        })

        test('All (Err) -> Err', () => {
            const result = Result.all([
                Result.Err('Error 1'),
                Result.Err('Error 2'),
                Result.Err('Error 3'),
            ])
            expect(result.isErr()).toBe(true)

            expect(() => result.unwrap()).toThrow('Error 1')
        })

        test('Ok, Ok and Err -> Err', () => {
            const result = Result.all([Result.Ok('val1'), Result.Ok('val2'), Result.Err()])
            expect(result.isErr()).toBe(true)
        })

        test('Err, Ok and Ok -> Err', () => {
            const result = Result.all([Result.Err(), Result.Ok('val1'), Result.Ok('val2')])
            expect(result.isErr()).toBe(true)
        })
    })
    describe('Semigroup', () => {
        test('Ok(a) concat Ok(b) -> Ok(c)', () => {
            const result = Result.Ok('Foo').concat(Result.Ok('Bar'))
            expect(result.unwrap()).toEqual('FooBar')
        })
        test('Ok(a) concat Err(b) -> Err(b)', () => {
            const result = Result.Ok('Foo').concat(Result.Err('Err1'))
            expect(() => result.unwrap()).toThrow('Err1')
        })

        test('Err(a) concat Ok(b) -> Err(a)', () => {
            const result = Result.Err('Err1').concat(Result.Ok('Foo'))
            expect(() => result.unwrap()).toThrow('Err1')
        })
        test('Err(a) concat Err(b) -> Err(a)', () => {
            const result = Result.Err('Err1').concat(Result.Err('Err2'))
            expect(() => result.unwrap()).toThrow('Err1')
        })
    })

    describe('examples', () => {
        const Version = { Version1: 'Version1', Version2: 'Version2' }

        const parseVersion = ([num] = []) => {
            switch (num) {
                case undefined:
                    return Result.Err('invalid header length')
                case 1:
                    return Result.Ok(Version.Version1)
                case 2:
                    return Result.Ok(Version.Version2)
                default:
                    return Result.Err('invalid version')
            }
        }

        test('parseVersion', () => {
            expect(() => parseVersion().unwrap()).toThrow('invalid header length')
            expect(parseVersion([1]).unwrap()).toEqual(Version.Version1)
            expect(parseVersion([2]).unwrap()).toEqual(Version.Version2)
            expect(() => parseVersion([99]).unwrap()).toThrow('invalid version')
        })

        test('try', () => {
            const parse = Result.try(JSON.parse)

            expect(() => parse('{"foo": "bar"').unwrap()).toThrow('Unexpected end of JSON input')
            expect(parse('{}').unwrap()).toEqual({})
        })
        test('await', async () => {
            const promise = Promise.resolve('OK')
            expect((await Result.promised(promise)).unwrap()).toEqual('OK')
        })
        test('applicative', () => {
            const r = Result.Ok((a) => (b) => `${a}-${b}`)
            expect(r.ap(Result.Ok('foo')).ap(Result.Ok('bar')).unwrapOr('')).toEqual('foo-bar')
            expect(r.ap(Result.Ok('foo')).ap(Result.Err()).unwrapOr('')).toEqual('')
        })

        test('bifunctor', () => {
            const onErr = () => new Error('Changed')
            const onOk = (value) => value.toUpperCase()

            Result.Ok('foo').bimap(onErr, onOk).fold(console.error, console.log)
            // -> 'FOO
            Result.Err().bimap(onErr, onOk).fold(console.error, console.log)
            // ->  Error: Changed
        })
    })
})
