/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
const suiteName = require('./package.json').name

module.exports = {
    ...require('../../../jest.base')(suiteName),
    globalSetup: '<rootDir>/test/__init__/setup.js',
    globalTeardown: '<rootDir>/test/__init__/teardown.js',
}
