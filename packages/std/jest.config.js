/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
const suiteName = require('./package.json').name
const {} = require('./tsconfig.json')
module.exports = {
    ...require('../../jest.base')(suiteName),
    moduleNameMapper: {
        '~/(.+)': '<rootDir>/$1',
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
