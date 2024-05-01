/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
const suiteName = require('./package.json').name
module.exports = {
    ...require('../../jest.base')(suiteName),
    testMatch: ['<rootDir>/**/*.spec.[jt]s?(x)'],
    moduleNameMapper: {
        '~/tests/(.+)': '<rootDir>/__tests__/$1',
        '~/(.+)': '<rootDir>/src/$1',
    },
    preset: 'ts-jest',
    transform: {
        // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
        // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                extends: './tsconfig.json',
            },
        ],
    },
}
