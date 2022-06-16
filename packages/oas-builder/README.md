# `oas-builder`

> TODO: description

## Usage

```
const OAS = require('@avanzu/oas-builder');

OAS.document()
    .info(OAS.info().version('1.2.3'))
    .server(OAS.server().url('https://dev.api.avanzu.de').description('Development server'))
    .server(OAS.server().url('https://api.avanzu.de').description('Production Server'))
    .tag(OAS.tag().name('Foo').description('Bar'))
    .valueOf()    
```
