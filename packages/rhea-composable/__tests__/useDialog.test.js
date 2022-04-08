const { useConnection, useDialog, useProcessor } = require('..')

describe('useDialog', () => {
    const { connectionOf } = useConnection()

    const connection = connectionOf('dialog', { username: 'admin' })
    const { openDialog } = useDialog(connection)
    const { processMessages } = useProcessor(connection)

    test('autoExpire', async () => {
        const { send } = openDialog('some-dialog')

        const promise = send({ ttl: 250, body: { foo: true }, subject: 'The Foo' })

        await expect(promise).rejects.toMatchObject({
            props: {
                condition: 'request:timeout',
                description: expect.stringContaining('timed out'),
            },
        })
    })

    test('goodResponse', async () => {
        const { send } = openDialog('some-dialog')
        processMessages('some-dialog', {
            'The Foo': () => ({ subject: 'The Bar', body: { bar: true } }),
        })

        const promise = send({ ttl: 250, body: { foo: true }, subject: 'The Foo' })

        await expect(promise).resolves.toMatchObject({
            subject: 'The Bar',
            body: { bar: true },
        })
    })
})
