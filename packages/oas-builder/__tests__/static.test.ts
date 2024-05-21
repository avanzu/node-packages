import OAS from '~/index'
import validator from 'oas-validator'
import S from 'fluent-json-schema'

describe('Static', () => {
    test('document', () => {
        expect(OAS.document()).toHaveProperty('valueOf')
        expect(OAS.info()).toHaveProperty('valueOf')
    })

    test('Building', async () => {
        const paths = {
            '/bar': OAS.path()
                .description('The bar')
                .get(
                    OAS.op()
                        .query(
                            S.object()
                                .prop('foo', S.string())
                                .prop('bar', S.string())
                                .required(['bar'])
                        )
                        // .query({ type: 'object', properties: { foo: { type: 'string' } } })
                        .Ok(
                            OAS.body()
                                .description('bar body')
                                .json(
                                    OAS.content()
                                        .addExample(
                                            'HavingFoo',
                                            OAS.example()
                                                .description('A Foo')
                                                .value({ foo: 'some foo' })
                                        )
                                        .addExample(
                                            'Having Bar',
                                            OAS.example()
                                                .description('A Bar')
                                                .value({ foo: 'some bar' })
                                        )
                                )
                        )
                        .NotFound()
                        .BadRequest()
                ),
            '/baz/{id}': OAS.path().description('The foo').get(OAS.op().idPath('id').NotFound()),
        }

        const doc = OAS.document()
            .info(OAS.info().version('1.2.3'))
            .server(OAS.server().url('https://dev.api.avanzu.de').description('Development server'))
            .server(OAS.server().url('https://api.avanzu.de').description('Production Server'))
            .tag(OAS.tag().name('Foo').description('Bar'))
            .paths(paths)
            .path(
                '/foo',
                OAS.path()
                    .get(
                        OAS.op()
                            .tag('Foo')
                            .security('oauth', 'read:stuff', 'write:stuff')
                            .id('FindStuff')
                            .parameter(OAS.param().name('foo'))
                            .request(
                                OAS.body()
                                    .description('bar')
                                    .json(OAS.content().schema(OAS.ref().schema('a-thing')))
                                    .xml(OAS.content().schema())
                            )
                            .response(
                                OAS.StatusCode.OK,
                                OAS.body()
                                    .description('foo')
                                    .json(OAS.content().schema(OAS.ref().schema('nuff')))
                                    .xml(OAS.content().example({}))
                            )
                            .response(
                                OAS.StatusCode.Accepted,
                                OAS.body()
                                    .description('foo')
                                    .header(
                                        'x-api-key',
                                        OAS.header().description('the apikey header')
                                    )
                                    .json(OAS.content().schema(OAS.ref().schema('nuff')))
                                    .xml(OAS.content().example({}))
                            )
                            .response(OAS.StatusCode.Created, OAS.ref().response('some-response'))
                    )
                    .post(
                        OAS.op('WriteStuff')
                            .description('Vestibulum ante ipsum primis in faucibus orci.')
                            .security('api_key')
                            .Ok(OAS.body().description('writes stuff'))
                            .NoContent()
                            .BadRequest()
                            .Forbidden()
                            .Unauthorized()
                    )
                    .put(
                        OAS.operation()
                            .id('ReplaceStuff')
                            .responses({
                                [OAS.StatusCode.OK]: OAS.body().description('replaces stuff'),
                                [OAS.StatusCode.Accepted]: OAS.body().description('replaces stuff'),
                                [OAS.StatusCode.BadRequest]:
                                    OAS.body().description('replaces stuff'),
                                [OAS.StatusCode.Unauthorized]:
                                    OAS.body().description('replaces stuff'),
                                [OAS.StatusCode.Unprocessable]:
                                    OAS.body().description('replaces stuff'),
                            })
                            .default(OAS.response().description('foo'))
                    )
            )
            .response(
                'some-response',
                OAS.body()
                    .description('some response')
                    .json(OAS.content().schema(OAS.ref().schema('bla')))
            )
            .schema('a-thing', { type: 'object' })
            .schema('nuff', { type: 'object' })
            .schema('bla', { type: 'object' })
            .securityScheme('api_key', OAS.scheme().typeApiKey('apikey', 'query'))
            .securityScheme(
                'oauth',
                OAS.securityScheme()
                    .typeOAuth2()
                    .flow(
                        'implicit',
                        OAS.flow()
                            .authorizationUrl('auth-url')
                            .scope('read:stuff', '')
                            .scope('write:stuff', '')
                    )
            )

        // console.log(JSON.stringify(doc.valueOf(), null, 2))

        const promise = validator.validate(doc.valueOf(), {})
        promise.catch(console.error)
        await expect(promise).resolves.toBeDefined()
    })
})
