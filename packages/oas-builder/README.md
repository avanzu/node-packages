# `oas-builder`

Code your openapi specifications using a fluent interface that integrates seamlessly with [fluent-json-schema](https://www.npmjs.com/package/fluent-json-schema). 

## Usage
The builder methods and factories follow the openapi specification relatively closely. You should be able to guess the corresponding factory function for a certain section of the spec. 


### Build your document 
```js
const OAS = require('@avanzu/oas-builder')
  
const document = OAS.document()
    .info(
        OAS.info().version('1.2.3')
    )
    .server(
        OAS.server()
            .url('https://dev.api.avanzu.de')
            .description('Development server')
    )
    .server(
        OAS.server()
            .url('https://api.avanzu.de')
            .description('Production Server')
    )
    .tag(
        OAS.tag()
            .name('Contacts')
            .description(
                'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices', 
                'posuere cubilia Curae Curabitur luctus lacus eros. ',
                'Mauris tortor lacus, condimentum nec eleifend in, aliquet ut metus.', 
                'Sed varius tellus vitae nisi congue eu fringilla tellus aliquet.',
                'Nulla suscipit porttitor velit, id lobortis orci congue at.' 
            )
    )

module.exports = document    
```


### Add Schemas 
When it comes to schemas, you can use [fluent-json-schema](https://www.npmjs.com/package/fluent-json-schema) or plain old objects. You can even mix both styles as you see fit. 
```js
const OAS = require('@avanzu/oas-builder')
const S = requrie('fluent-json-schema')

const addSchemas = (document) => {

    const contact = S.object()
        .prop('name', S.string())
        .prop('email', S.string().format('email'))

    return document
        .schema('Contact', contact)
        .schema(
            'Phone', 
            { 
                type: 'object', 
                properties: { 
                    mobile: { type: 'string' } 
                } 
            }
        )
}
```

### Add Paths 

All builder methods ***do not change*** the internal state of that instance. Instead they will produce a ***new instance*** with the new internal state. 
You have to take that into account when you intend to stop and restart chaining. 

This allows to _branch off_ from a common base element without interference. 

```js
const OAS = require('@avanzu/oas-builder')
const S = requrie('fluent-json-schema')

const addPath = (document) => {

    const baseOp = OAS.op().tag('Contacts').BadRequest().GatewayTimeout()

    const listContacts = baseOp
        .id('listContacts')
        .Ok(
            OAS.body()
                .description('lists contacts')
                .json(OAS.content().schema(S.object()).example({}))
        )

    const addContact = baseOp
        .id('addContact')
        .request(
            OAS.body()
                .description('add contact payload')
                .json(OAS.content().schema(contactSchema))
        )
        .Created(
            OAS.body()
                .json(OAS.content().schema(OAS.ref().schema('Contact')))
                .description('added contact')
        )

    const getContact = baseOp
        .id('getContact')
        .idPath('id')
        .Ok(
            OAS.body()
                .json(OAS.content().schema(OAS.ref().schema('Contact')))
                .description('found contact')
        )
        .NotFound()

    return document
        .path('/contacts', OAS.path().get(listContacts).post(addContact))
        .path('/contacts/{id}', OAS.path().get(getContact))
}
```
### Render your spec
In order to generate the JSON representation, you will have to call the `valueOf` method. 
```js

const openapiJSON = document.valueOf() 

```
## Shorthands and quality of life features
The openapi specification can be somewhat cumbersome to write. Hence, most of the builders come with a few shorthands to improve the developer experience. 

### Descriptions
Since regular javascript strings cannot be written in multiple lines naturally and template strings will probably mess up your indentation, every `description` method accepts an arbitrarty amount of strings which will be joined with a line break `\n`. For an example, see the `tag` definition in [build your document](#build-your-document).

### `OAS.document()`
The document builder provides shorthands for the `components` section of the openapi document section. 
 - `schema(name, value)` - Adds the given schema to the `schemas` field, using the given name as key.
 - `response(name, value)` - Adds the given response to the `responses` field, using the given name as key. 
 - `parameter(name, value)` - adds the given parameter to the `parameters` field, using the given name as key. 
 - `example(name, value)` - adds the given example to the `examples` field, using the gven name as key.
 - `requestBody(name, value)` - adds the given requestBody to the `requestBodies` field, using the gven name as key.
 - `header(name, value)` - adds the given header to the `headers` field, using the gven name as key.
 - `securityScheme(name, value)` - adds the given securityScheme to the `securitySchemes` field, using the gven name as key.
 
### `OAS.ref()`
The reference builder provides shorthands into the `components` section of the openapi document. 
 - `schema(name)` - generates a reference to the given name in the `schemas` field 
 - `response(name)` - generates a reference to the given name in the `responses` field 
 - `param(name)` - generates a reference to the given name in the `parameters` field 
 - `body(name)` - generates a reference to the given name in the `requestBodies` field 
 - `header(name)` - generates a reference to the given name in the `headers` field 
 - `security(name)` - generates a reference to the given name in the `securitySchemes` field 
 - `link(name)` - generates a reference to the given name in the `links` field 
 - `callback(name)` - generates a reference to the given name in the `callbacks` field 
 - `pathItem(name)` - generates a reference to the given name in the `pathItems` field 

### `OAS.op()`
 - `idPath(name[, description[, type]])` - adds a required path parameter with the given name to the parameters of the operation. 
 - `query(schema)` - adds the properties of the given schema (plain or fluent) as query parameters to the operation. 
  
#### Responses
For the most used response types in terms of status codes, there are individual methods with semantic names relating to the http status texts. 

**Success**
| Method         | Body     | Status code | Status text   |
| -------------- | -------- | ----------- | ------------- |
| `Ok`           | required | 200         | OK            |
| `Created`      | required | 201         | Created       |
| `Accepted`     | required | 202         | Accepted      |
| `NoContent`    | required | 204         | No Content    |
| `ResetContent` | required | 205         | Reset Content |

**Client errors** 
> If you omit the response body, a default will be used with a description that is equal to the method name. 

| Method             | Body     | Status code | Status text        |
| ------------------ | -------- | ----------- | ------------------ |
| `BadRequest`       | optional | 400         | Bad Request        |
| `Unauthorized`     | optional | 401         | Unauthorized       |
| `Forbidden`        | optional | 403         | Forbidden          |
| `NotFound`         | optional | 404         | Not Found          |
| `MethodNotAllowed` | optional | 405         | Method Not Allowed |
| `NotAcceptable`    | optional | 406         | Not Acceptable     |
| `RequestTimeout`   | optional | 408         | Request Timeout    |
| `Conflict`         | optional | 409         | Conflict           |
| `Unprocessable`    | optional | 422         | Unprocessable      |


**Server error**
> If you omit the response body, a default will be used with a description that is equal to the method name. 

| Method               | Body    | Status code | Status text         |
| -------------------- | ------- | ----------- | ------------------- |
| `GeneralError`       | optonal | 500         | General Error       |
| `NotImplemented`     | optonal | 501         | Not Implemented     |
| `BadGateway`         | optonal | 502         | Bad Gateway         |
| `ServiceUnavailable` | optonal | 503         | Service Unavailable |
| `GatewayTimeout`     | optonal | 504         | Gateway Timeout     |

### `OAS.body()`
For the most used media types, there are also semantic methods available. 
| Method | Media type         |
| ------ | ------------------ |
| `json` | `application/json` |
| `text` | `text/plain`       |
| `xml`  | `application/xml`  |
| `any`  | `*/*`              |

