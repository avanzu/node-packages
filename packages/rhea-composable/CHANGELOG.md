# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.8.3](https://github.com/avanzu/node-packages/compare/@avanzu/rhea-composable@1.8.2...@avanzu/rhea-composable@1.8.3) (2022-09-21)

**Note:** Version bump only for package @avanzu/rhea-composable





## [1.8.2](https://github.com/avanzu/node-packages/compare/@avanzu/rhea-composable@1.8.1...@avanzu/rhea-composable@1.8.2) (2022-09-11)

**Note:** Version bump only for package @avanzu/rhea-composable





## [1.8.1](https://github.com/avanzu/node-packages/compare/@avanzu/rhea-composable@1.8.0...@avanzu/rhea-composable@1.8.1) (2022-08-08)


### Bug Fixes

* prevent error information loss ([4b56b81](https://github.com/avanzu/node-packages/commit/4b56b81a2d0d00c8a774689b647e208a6501a1e4))





# [1.8.0](https://github.com/avanzu/node-packages/compare/@avanzu/rhea-composable@1.7.0...@avanzu/rhea-composable@1.8.0) (2022-06-16)


### Features

* Adds openapi fluent builder package ([6be28c2](https://github.com/avanzu/node-packages/commit/6be28c26c5dc471130df72d7a381ba3960adbb15))





# [1.7.0](https://github.com/avanzu/node-packages/compare/@avanzu/rhea-composable@1.6.0...@avanzu/rhea-composable@1.7.0) (2022-05-17)


### Features

* adds exception when trying to send whilst not sendable ([4871e46](https://github.com/avanzu/node-packages/commit/4871e4692335ac2cf69df3f5928ff256fd3fee56))





# [1.6.0](https://github.com/avanzu/node-packages/compare/@avanzu/rhea-composable@1.5.1...@avanzu/rhea-composable@1.6.0) (2022-05-15)


### Bug Fixes

* actual error instances will now be preserved during processing ([351682b](https://github.com/avanzu/node-packages/commit/351682b25f3932b4f0419eb617b7c2502d873f95))
* success status assignment will now preserve application_properties ([592c9b3](https://github.com/avanzu/node-packages/commit/592c9b30ecae6e46057384300bf255a0a45b781e))


### Features

* adds catch all dispatcher convenience ([ad31fae](https://github.com/avanzu/node-packages/commit/ad31faeef407790da5da0d78372857588e72c632))





## [1.5.1](https://github.com/avanzu/node-packages/compare/@avanzu/rhea-composable@1.5.0...@avanzu/rhea-composable@1.5.1) (2022-05-04)


### Bug Fixes

* moves connection pool outside of the composable ([2018b60](https://github.com/avanzu/node-packages/commit/2018b60634dfa24ce37ecdbd1c38354eca12eff5))





# [1.5.0](https://github.com/avanzu/node-packages/compare/@avanzu/rhea-composable@1.4.2...@avanzu/rhea-composable@1.5.0) (2022-04-12)


### Features

* adds support for default processing callable ([786c463](https://github.com/avanzu/node-packages/commit/786c4636d78b7d5970d6f3e065c1c4a9272a031a))





## [1.4.2](https://github.com/avanzu/node-packages/compare/@avanzu/rhea-composable@1.4.1...@avanzu/rhea-composable@1.4.2) (2022-04-12)


### Bug Fixes

* adds error handler for issues during send ([c93e94f](https://github.com/avanzu/node-packages/commit/c93e94fa1ac91f57ad9e00c33763b45ef7588b9a))





## [1.4.1](https://github.com/avanzu/node-packages/compare/@avanzu/rhea-composable@1.4.0...@avanzu/rhea-composable@1.4.1) (2022-04-11)


### Bug Fixes

* expired requests will now set the delivery to undeliverable_here ([e8fe44c](https://github.com/avanzu/node-packages/commit/e8fe44c1ae6e2d1edaa6540c0267c63ecff0d163))





# [1.4.0](https://github.com/avanzu/node-packages/compare/@avanzu/rhea-composable@1.3.0...@avanzu/rhea-composable@1.4.0) (2022-04-11)


### Features

* adds connection string support ([bfa30e2](https://github.com/avanzu/node-packages/commit/bfa30e22c8ddf794024c20ac8d3eb79901e93cb4))





# [1.3.0](https://github.com/avanzu/node-packages/compare/@avanzu/rhea-composable@1.2.0...@avanzu/rhea-composable@1.3.0) (2022-04-09)


### Features

* adds delivery composable ([3c2ca22](https://github.com/avanzu/node-packages/commit/3c2ca2216faf155d02eb18a43065a78989da829a))
* adds dispatcher composable ([1b7da15](https://github.com/avanzu/node-packages/commit/1b7da150b66ec00f7bab7cfe5c038ef63e318db0))
* adds duplex composable ([64ac263](https://github.com/avanzu/node-packages/commit/64ac26356f317b88ed73758210406ff670ef7891))
* adds message composable ([4bcc3a5](https://github.com/avanzu/node-packages/commit/4bcc3a56450da6b58c51f760e308e6a569c02af8))
* adds utility functions to errors module ([a8b1d59](https://github.com/avanzu/node-packages/commit/a8b1d59c43d2f985309d9caca5476360dba41e9d))





# [1.2.0](https://github.com/avanzu/node-packages/compare/@avanzu/rhea-composable@1.1.0...@avanzu/rhea-composable@1.2.0) (2022-04-08)


### Bug Fixes

* adds missing dependency ([d5c809e](https://github.com/avanzu/node-packages/commit/d5c809e1ea33c9518975a560abbec4d3e9b5a771))


### Features

* adds auto expire to requests ([eb5563b](https://github.com/avanzu/node-packages/commit/eb5563b98563250c5557079e1b77f29405f93829))
* adds request/reply pattern ([4614e3b](https://github.com/avanzu/node-packages/commit/4614e3b78b7aa93f53c2fa3a87d783e89762d255))
* adds timeout storage and auto clear on drop ([ee4bd42](https://github.com/avanzu/node-packages/commit/ee4bd429d405a22472395f1b22f83d9b409d556e))
* use request ttl for reply ([70eab94](https://github.com/avanzu/node-packages/commit/70eab9457db32048123330c8291c36ce8fe18a6e))





# 1.1.0 (2022-04-07)


### Features

* initial commit ([ba0d0e1](https://github.com/avanzu/node-packages/commit/ba0d0e198761a8a72d16835c9cd105bbbe4c323f))
