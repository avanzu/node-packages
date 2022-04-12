const { useConnection, useDialog, useProcessor } = require('..')
const { panic } = require('../lib/errors')
const { debug } = require('../lib/inspect')('test/useDialog')
describe('useDialog', () => {
    const { connectionOf } = useConnection()

    const connection = connectionOf('dialog', { username: 'admin' })
    const { openDialog } = useDialog(connection)
    const { processMessages } = useProcessor(connection)

    test('autoExpire', async () => {
        debug('autoExpire', '-'.repeat(40))
        const { send } = openDialog('some-dialog')
        const promise = send({ ttl: 250, body: { foo: true }, subject: 'The Foo' })
        await expect(promise).rejects.toMatchObject({
            props: {
                condition: 'request:timeout',
                description: expect.stringContaining('timed out'),
            },
        })
    })

    test('lateResponse', async () => {
        debug('lateResponse', '-'.repeat(40))
        const { send } = openDialog('late-response')
        processMessages('late-response', {
            Idle: () => new Promise((resolve) => setTimeout(resolve, 300)),
        })
        const promise = send({ ttl: 250, body: { foo: true }, subject: 'Idle' })
        await expect(promise).rejects.toMatchObject({
            props: {
                condition: 'request:timeout',
                description: expect.stringContaining('timed out'),
            },
        })
    })

    test('goodResponse', async () => {
        debug('goodResponse', '-'.repeat(40))
        const { send } = openDialog('some-foo')
        processMessages('some-foo', {
            'The Foo': () => ({ subject: 'The Bar', body: { bar: true } }),
        })

        const promise = send({ ttl: 250, body: { foo: true }, subject: 'The Foo' })

        await expect(promise).resolves.toMatchObject({
            subject: 'The Bar',
            body: { bar: true },
        })
    })

    test('badResponse', async () => {
        debug('badResponse', '-'.repeat(40))
        const { send } = openDialog('some-bar')
        processMessages('some-bar', {
            'The Bar': () => panic(new Error('No bueno')),
        })

        const promise = send({ ttl: 250, body: { foo: true }, subject: 'The Bar' })

        await expect(promise).rejects.toMatchObject({
            subject: 'processing:failed',
            body: expect.stringContaining('No bueno'),
        })
    })

    test('malformed message', async () => {
        debug('malformed message', '-'.repeat(40))
        const { send } = openDialog('some-bar')
        processMessages('some-bar', {
            'The Bar': () => panic(new Error('No bueno')),
        })

        const promise = send({ ttl: 250, body: { foo: true }, user_id: 123, subject: 'The Bar' })

        await expect(promise).rejects.toMatchObject({
            subject: 'sending:failed',
            body: expect.stringContaining('ERR_INVALID_ARG_TYPE'),
        })
    })
})
