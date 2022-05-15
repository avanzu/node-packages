const { processFault, toPayload } = require('../lib/errors')
describe('useErors', () => {
    describe('processFault', () => {
        it('should preserve actual errors', () => {
            const err = new Error('Actual error')
            expect(processFault(err)).toBe(err)
        })

        it('should generate proper errors from non error input', () => {
            expect(processFault('A string')).toBeInstanceOf(Error)
        })
    })
    describe('payloadGenerator', () => {
        it('should add application properties', () => {
            const err = Object.assign(new Error('With status'), {
                code: 404,
                props: { condition: 'some-condition', description: 'some description' },
            })
            expect(toPayload(err)).toMatchObject({
                subject: 'some-condition',
                body: 'some description',
                application_properties: expect.objectContaining({
                    statusCode: 404,
                }),
            })
        })

        it('should add reasonable defaults for unspecific errors', () => {
            const err = new Error('With status')
            expect(toPayload(err)).toMatchObject({
                subject: '',
                body: 'With status',
                application_properties: expect.objectContaining({
                    statusCode: 500,
                }),
            })
        })
    })
})
