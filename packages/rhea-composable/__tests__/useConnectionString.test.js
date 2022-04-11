const { useConnectionString } = require('..')
describe('useConnectionString', () => {
    const { parse } = useConnectionString()

    test('Object', () => {
        const result = parse({ username: 'bar' })
        expect(result).toEqual({ username: 'bar' })
    })
    test('String', () => {
        const result = parse('amqp10://bar@localhost:5672')
        expect(result).toEqual({
            username: 'bar',
            host: 'localhost',
            port: '5672',
            password: '',
        })
    })
})
