/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

import jestConfig from './jest.config'

export default {
    ...jestConfig,
    testMatch: ['<rootDir>/**/*.test.[jt]s?(x)'],
    globalSetup: '<rootDir>/__tests__/__init__/setup.ts',
}
