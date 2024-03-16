module.exports = (suiteName) => ({
    collectCoverage: true,
    collectCoverageFrom: ['src/**', 'lib/**'],
    coverageDirectory: './coverage',
    coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/'],
    coverageProvider: 'babel',
    coverageReporters: ['json-summary', 'text', 'cobertura'],
    reporters: [
        'default',
        ['jest-junit', { suiteName, classNameTemplate: '{classname}', titleTemplate: '{title}' }],
    ],
    setupFiles: ['trace-unhandled/register'],
    testEnvironment: 'node',
    testMatch: ['<rootDir>/**/*.(test|spec).[jt]s?(x)'],
    verbose: true,
    detectOpenHandles: true,
    forceExit: true,
})
