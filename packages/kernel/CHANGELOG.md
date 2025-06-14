# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.7.3](https://github.com/avanzu/node-packages/compare/@avanzu/kernel@1.7.2...@avanzu/kernel@1.7.3) (2025-06-03)


### Bug Fixes

* updates openapi generator to support multiple methods ([709ca52](https://github.com/avanzu/node-packages/commit/709ca52a5fae1abf4aa5542bc072a5d6b461a5a0))





## [1.7.2](https://github.com/avanzu/node-packages/compare/@avanzu/kernel@1.7.1...@avanzu/kernel@1.7.2) (2025-06-03)


### Bug Fixes

*  prevent operations from overriding each other ([0149c62](https://github.com/avanzu/node-packages/commit/0149c62addcf4d0f0f21cada29690ef18e1a12d8))





## [1.7.1](https://github.com/avanzu/node-packages/compare/@avanzu/kernel@1.7.0...@avanzu/kernel@1.7.1) (2025-05-21)

**Note:** Version bump only for package @avanzu/kernel





# [1.7.0](https://github.com/avanzu/node-packages/compare/@avanzu/kernel@1.6.2...@avanzu/kernel@1.7.0) (2025-05-14)


### Features

* adds route naming and name based url generation ([afd483e](https://github.com/avanzu/node-packages/commit/afd483e3c6aeb0cf9ad4aa4070409b02d5860e12))





## [1.6.2](https://github.com/avanzu/node-packages/compare/@avanzu/kernel@1.6.1...@avanzu/kernel@1.6.2) (2025-05-08)


### Bug Fixes

* renames generic type Body to avoid conflict with ambient type ([556461d](https://github.com/avanzu/node-packages/commit/556461d4be5a0d9c60490245a37816b40ecacc9d))





## [1.6.1](https://github.com/avanzu/node-packages/compare/@avanzu/kernel@1.6.0...@avanzu/kernel@1.6.1) (2025-04-24)


### Bug Fixes

* adds missing generic to publishEvent method ([3a90c4e](https://github.com/avanzu/node-packages/commit/3a90c4ede4aac67131e095a7a8ed1a43a5e87796))





# [1.6.0](https://github.com/avanzu/node-packages/compare/@avanzu/kernel@1.5.1...@avanzu/kernel@1.6.0) (2025-04-24)


### Bug Fixes

* adds missing barrel exports ([1011646](https://github.com/avanzu/node-packages/commit/1011646995197af92f2569e0a633d09718d6639c))


### Features

* replaces axios with @avanzu/httpkernel ([d9aae80](https://github.com/avanzu/node-packages/commit/d9aae8045c0509b92ef3f406dd2481c342b4148f))





## [1.5.1](https://github.com/avanzu/node-packages/compare/@avanzu/kernel@1.5.0...@avanzu/kernel@1.5.1) (2025-04-21)


### Bug Fixes

* removes invalid export ([b24c7d0](https://github.com/avanzu/node-packages/commit/b24c7d00e73e65105ad2a3440f63cae1d097e7e7))





# [1.5.0](https://github.com/avanzu/node-packages/compare/@avanzu/kernel@1.4.4...@avanzu/kernel@1.5.0) (2025-04-21)


### Features

* adds container modules ([9927acb](https://github.com/avanzu/node-packages/commit/9927acb02b73d530cf974179c0d2f3e64b630270))
* adds decorator based documentation ([a9e309b](https://github.com/avanzu/node-packages/commit/a9e309b6900a7facbc91bb2476708e7ed820ddf6))
* introduces container modules and message bus ([35fd18d](https://github.com/avanzu/node-packages/commit/35fd18d2cc0a460b63d8cf220553048c7ec7694c))
* introduces optional plugin system ([0e0e0b3](https://github.com/avanzu/node-packages/commit/0e0e0b31068d3b279b77be2d22e4041f28795f11))
* resolves messageBus into kernel core component ([021ce14](https://github.com/avanzu/node-packages/commit/021ce148d3f5af47ceea8d96a0b914cd6f222dc8))





## [1.4.4](https://github.com/avanzu/node-packages/compare/@avanzu/kernel@1.4.3...@avanzu/kernel@1.4.4) (2024-06-07)

**Note:** Version bump only for package @avanzu/kernel





## [1.4.3](https://github.com/avanzu/node-packages/compare/@avanzu/kernel@1.4.2...@avanzu/kernel@1.4.3) (2024-05-21)

**Note:** Version bump only for package @avanzu/kernel





## [1.4.2](https://github.com/avanzu/node-packages/compare/@avanzu/kernel@1.4.1...@avanzu/kernel@1.4.2) (2024-05-20)


### Bug Fixes

* fixes incorrect import ([f434a03](https://github.com/avanzu/node-packages/commit/f434a0351be45c73843d4e9656cad71d68ba3ebb))





## [1.4.1](https://github.com/avanzu/node-packages/compare/@avanzu/kernel@1.4.0...@avanzu/kernel@1.4.1) (2024-05-20)

**Note:** Version bump only for package @avanzu/kernel





# [1.4.0](https://github.com/avanzu/node-packages/compare/@avanzu/kernel@1.3.0...@avanzu/kernel@1.4.0) (2024-05-14)


### Features

* introduces resource definitions and basic authorization mechanism ([ccf9a8b](https://github.com/avanzu/node-packages/commit/ccf9a8b3f167151f3a4d88638d81dcca3c814d1b))





# [1.3.0](https://github.com/avanzu/node-packages/compare/@avanzu/kernel@1.2.0...@avanzu/kernel@1.3.0) (2024-05-11)


### Features

* consolidates authentication into kernel package ([035fbd3](https://github.com/avanzu/node-packages/commit/035fbd31e272c2572da6db8fd2f4ede84a7df2de))
* implements authentication service with mikroom integration ([49a1a1d](https://github.com/avanzu/node-packages/commit/49a1a1d733ffb4883b779ee9d14aa5334fe78159))
* introduces usecase payload resolver, improves error handling ([f8ddc31](https://github.com/avanzu/node-packages/commit/f8ddc310ab59c9e35611227dd59c268ae59e423f))
* Introduces validator middleware and corresponding errors ([7907fcd](https://github.com/avanzu/node-packages/commit/7907fcdb916da04c4ed3cd2b4d8d92967c7d6d72))
* introuces features, UseCases and corresponding templates ([e098dcb](https://github.com/avanzu/node-packages/commit/e098dcb7aba831ec40edad9982f88f0fc01487ca))





# [1.2.0](https://github.com/avanzu/node-packages/compare/@avanzu/kernel@1.1.0...@avanzu/kernel@1.2.0) (2024-05-04)


### Features

* extends app generator, replaces awilix-koa with routing decorators ([6bfc7d5](https://github.com/avanzu/node-packages/commit/6bfc7d5f396c9f41fdf318422118319c3af26208))





# 1.1.0 (2024-05-01)


### Features

* adds new kernel package and demo implementation ([a15ab64](https://github.com/avanzu/node-packages/commit/a15ab648e190fbf9d3b010601bf06845b58406aa))





## [1.1.2](https://github.com/avanzu/node-packages/compare/@avanzu/decorators@1.1.1...@avanzu/decorators@1.1.2) (2024-04-29)

**Note:** Version bump only for package @avanzu/decorators





## [1.1.1](https://github.com/avanzu/node-packages/compare/@avanzu/decorators@1.1.0...@avanzu/decorators@1.1.1) (2024-04-29)

**Note:** Version bump only for package @avanzu/decorators





# 1.1.0 (2024-04-28)


### Features

* introduces logging and plugin decorators ([41d2eee](https://github.com/avanzu/node-packages/commit/41d2eee3bd3baba5a5893810bc64c47cf6014c8c))
