/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

module.exports = {
    ...require('./jest.config'),
    testMatch: ['<rootDir>/**/*.test.[jt]s?(x)'],
    globalSetup: '<rootDir>/__tests__/__init__/setup.ts',
}
