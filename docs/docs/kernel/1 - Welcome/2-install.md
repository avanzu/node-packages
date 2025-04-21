---
title: Installation
sidebar_label: Install
---
Create a new typescript enabled project.

```bash
mkdir <myproject> && cd <myproject>

npm init

npm i -D typescript

npx tsc --init
```
Make sure to enable experimental decorators.
```jsonc
// tsconfig.json
{
    "compilerOptions" : {
        //...
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
    }
}
```

Install dependencies

```bash
npm i @avanzu/kernel jsonwebtoken pino
```

Install minimum dev dependencies

```bash
npm i -D @types/koa
```

Install additional (dev) dependencies as needed.

