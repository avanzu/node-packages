const useDispatcher = require('../lib/useDispatcher')

describe('The dispatcher', () => {
    it('should handle a dispatch table with distinct handlers', async () => {
        const foo = jest.fn()
        const bar = jest.fn()
        const { dispatch } = useDispatcher({ foo, bar })

        await dispatch({ message: { subject: 'foo' } })
        await dispatch({ message: { subject: 'bar' } })

        expect(foo).toHaveBeenCalled()
        expect(bar).toHaveBeenCalled()
    })

    it('should handle a dispatch table with a default handler', async () => {
        const catchAll = jest.fn()
        const foo = jest.fn()
        const { dispatch } = useDispatcher({ foo, default: catchAll })
        await dispatch({ message: { subject: 'foo' } })
        await dispatch({ message: { subject: 'bar' } })

        expect(foo).toHaveBeenCalledWith({ message: { subject: 'foo' } })
        expect(catchAll).toHaveBeenCalledWith({ message: { subject: 'bar' } })
    })

    it('should accept a single function as catchall handler', async () => {
        const catchAll = jest.fn()
        const { dispatch } = useDispatcher(catchAll)
        await dispatch({ message: { subject: 'foo' } })
        await dispatch({ message: { subject: 'bar' } })

        expect(catchAll).toHaveBeenCalledWith({ message: { subject: 'foo' } })
        expect(catchAll).toHaveBeenCalledWith({ message: { subject: 'bar' } })
    })
})
