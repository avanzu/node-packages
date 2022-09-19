/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
const suiteName = require('./package.json').name
module.exports = {
    ...require('../../jest.base')(suiteName),
    bail: true,
    bail: 3,
    globalSetup: '<rootDir>/__tests__/__init__/setup.js',
    globalTeardown: '<rootDir>__tests__/__init__/teardown.js',
}
