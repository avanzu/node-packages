const { Result } = require('..')
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
    })
})
