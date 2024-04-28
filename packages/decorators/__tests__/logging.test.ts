import { LogBox, Logger, Log, LogAsync } from '~/index'

describe('The LogBox', () => {
    class LogTest {
        @Log({ enter: true, exit: false })
        noPrefixBeforeDefaultLevel() {
            return 'never'
        }
        @Log({ enter: false, exit: true })
        noPrefixAfterDefaultLevel() {
            return 'never'
        }

        @Log({ enter: false, exit: true, result: true })
        noPrefixAfterDefaultLevelReturn() {
            return 'SomeValue'
        }
        @Log({ enter: false, exit: true, args: true })
        noPrefixAfterDefaultLevelArguments(somearg: string) {
            return 'never'
        }

        @Log({ enter: false, exit: false })
        noPrefixError() {
            throw new Error('Failing')
        }

        @Log({
            enter: true,
            exit: true,
            enterPrefix: '[+]',
            exitPrefix: '[-]',
            args: true,
            result: true,
        })
        enterExitPrefixedWithArgsAndResult(somearg: string) {
            return `${somearg}-result`
        }
        @LogAsync({ enter: true, exit: false })
        async asyncNoPrefixBeforeDefaultLevel() {
            return 'never'
        }
        @LogAsync({ enter: false, exit: true })
        async asyncNoPrefixAfterDefaultLevel() {
            return 'never'
        }

        @LogAsync({ enter: false, exit: true, result: true })
        async asyncNoPrefixAfterDefaultLevelReturn() {
            return 'SomeValue'
        }
        @LogAsync({ enter: false, exit: true, args: true })
        async asyncNoPrefixAfterDefaultLevelArguments(somearg: string) {
            return 'never'
        }

        @LogAsync({ enter: false, exit: false })
        async asyncNoPrefixError() {
            throw new Error('Failing')
        }

        @LogAsync({
            enter: true,
            exit: true,
            enterPrefix: '[+]',
            exitPrefix: '[-]',
            args: true,
            result: true,
        })
        async asyncEnterExitPrefixedWithArgsAndResult(somearg: string) {
            return `${somearg}-result`
        }
    }

    let logger: Logger
    let instance: LogTest

    beforeEach(() => {
        logger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        }
        LogBox.use(logger)
        instance = new LogTest()
    })

    test('noPrefixBeforeDefaultLevel', () => {
        instance.noPrefixBeforeDefaultLevel()

        expect(logger.info).toHaveBeenCalledWith('LogTest.noPrefixBeforeDefaultLevel()', {
            time: expect.any(Number),
            className: 'LogTest',
            methodName: 'noPrefixBeforeDefaultLevel',
        })
    })
    test('noPrefixAfterDefaultLevel', () => {
        instance.noPrefixAfterDefaultLevel()

        expect(logger.info).toHaveBeenCalledWith('LogTest.noPrefixAfterDefaultLevel()', {
            time: expect.any(Number),
            className: 'LogTest',
            methodName: 'noPrefixAfterDefaultLevel',
            ms: expect.any(Number),
        })
    })
    test('noPrefixAfterDefaultLevelReturn', () => {
        let result = instance.noPrefixAfterDefaultLevelReturn()

        expect(logger.info).toHaveBeenCalledWith('LogTest.noPrefixAfterDefaultLevelReturn()', {
            time: expect.any(Number),
            className: 'LogTest',
            methodName: 'noPrefixAfterDefaultLevelReturn',
            ms: expect.any(Number),
            result,
        })
    })
    test('noPrefixAfterDefaultLevelArguments', () => {
        instance.noPrefixAfterDefaultLevelArguments('MyArgument')

        expect(logger.info).toHaveBeenCalledWith('LogTest.noPrefixAfterDefaultLevelArguments()', {
            time: expect.any(Number),
            className: 'LogTest',
            methodName: 'noPrefixAfterDefaultLevelArguments',
            ms: expect.any(Number),
            args: ['MyArgument'],
        })
    })
    test('noPrefixError', () => {
        let error: Error | unknown
        try {
            instance.noPrefixError()
            throw new Error('NotTheRightOne')
        } catch (e) {
            error = e
        }
        expect(logger.error).toHaveBeenCalledWith('LogTest.noPrefixError()', {
            time: expect.any(Number),
            className: 'LogTest',
            methodName: 'noPrefixError',
            ms: expect.any(Number),
            error: error,
        })
    })

    test('enterExitPrefixedWithArgsAndResult', () => {
        let result = instance.enterExitPrefixedWithArgsAndResult('MyArgument')

        expect(logger.info).toHaveBeenCalledWith(
            '[+] LogTest.enterExitPrefixedWithArgsAndResult()',
            {
                time: expect.any(Number),
                className: 'LogTest',
                methodName: 'enterExitPrefixedWithArgsAndResult',
                args: ['MyArgument'],
            }
        )

        expect(logger.info).toHaveBeenCalledWith(
            '[-] LogTest.enterExitPrefixedWithArgsAndResult()',
            {
                time: expect.any(Number),
                className: 'LogTest',
                methodName: 'enterExitPrefixedWithArgsAndResult',
                ms: expect.any(Number),
                args: ['MyArgument'],
                result,
            }
        )
    })

    test('asyncNoPrefixBeforeDefaultLevel', async () => {
        await instance.asyncNoPrefixBeforeDefaultLevel()

        expect(logger.info).toHaveBeenCalledWith('LogTest.asyncNoPrefixBeforeDefaultLevel()', {
            time: expect.any(Number),
            className: 'LogTest',
            methodName: 'asyncNoPrefixBeforeDefaultLevel',
        })
    })
    test('asyncNoPrefixAfterDefaultLevel', async () => {
        await instance.asyncNoPrefixAfterDefaultLevel()

        expect(logger.info).toHaveBeenCalledWith('LogTest.asyncNoPrefixAfterDefaultLevel()', {
            time: expect.any(Number),
            className: 'LogTest',
            methodName: 'asyncNoPrefixAfterDefaultLevel',
            ms: expect.any(Number),
        })
    })
    test('asyncNoPrefixAfterDefaultLevelReturn', async () => {
        let result = await instance.asyncNoPrefixAfterDefaultLevelReturn()

        expect(logger.info).toHaveBeenCalledWith('LogTest.asyncNoPrefixAfterDefaultLevelReturn()', {
            time: expect.any(Number),
            className: 'LogTest',
            methodName: 'asyncNoPrefixAfterDefaultLevelReturn',
            ms: expect.any(Number),
            result,
        })
    })
    test('asyncNoPrefixAfterDefaultLevelArguments', async () => {
        await instance.asyncNoPrefixAfterDefaultLevelArguments('MyArgument')

        expect(logger.info).toHaveBeenCalledWith(
            'LogTest.asyncNoPrefixAfterDefaultLevelArguments()',
            {
                time: expect.any(Number),
                className: 'LogTest',
                methodName: 'asyncNoPrefixAfterDefaultLevelArguments',
                ms: expect.any(Number),
                args: ['MyArgument'],
            }
        )
    })
    test('asyncNoPrefixError', async () => {
        let error: Error | unknown
        try {
            await instance.asyncNoPrefixError()
            throw new Error('NotTheRightOne')
        } catch (e) {
            error = e
        }
        expect(logger.error).toHaveBeenCalledWith('LogTest.asyncNoPrefixError()', {
            time: expect.any(Number),
            className: 'LogTest',
            methodName: 'asyncNoPrefixError',
            ms: expect.any(Number),
            error: error,
        })
    })

    test('asyncEnterExitPrefixedWithArgsAndResult', async () => {
        let result = await instance.asyncEnterExitPrefixedWithArgsAndResult('MyArgument')

        expect(logger.info).toHaveBeenCalledWith(
            '[+] LogTest.asyncEnterExitPrefixedWithArgsAndResult()',
            {
                time: expect.any(Number),
                className: 'LogTest',
                methodName: 'asyncEnterExitPrefixedWithArgsAndResult',
                args: ['MyArgument'],
            }
        )

        expect(logger.info).toHaveBeenCalledWith(
            '[-] LogTest.asyncEnterExitPrefixedWithArgsAndResult()',
            {
                time: expect.any(Number),
                className: 'LogTest',
                methodName: 'asyncEnterExitPrefixedWithArgsAndResult',
                ms: expect.any(Number),
                args: ['MyArgument'],
                result,
            }
        )
    })
})
