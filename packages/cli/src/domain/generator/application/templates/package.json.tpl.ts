import { GeneratorContext, GeneratorArguments } from '../../common/context'
import { Template } from '../../common/template'

export interface PackageJSONArguments extends GeneratorArguments {
    packageName: string
    author?: string
    description?: string
    license?: string
}

export class PackageJSON implements Template {
    target: string = ''
    directory: string = './'
    filename: string = 'package.json'
    async render(context: GeneratorContext<PackageJSONArguments>): Promise<string> {
        let contents = {
            name: context.packageName,
            version: '1.0.0',
            description: context.description || '',
            main: 'dist/index.js',
            private: true,
            scripts: {
                prebuild: 'rimraf ./dist',
                build: 'tsc --project tsconfig.build.json',
                postbuild: 'tsc-alias -p tsconfig.build.json',
                test: 'jest',
                'test:integration': 'jest --config=jest.integration.config.js',
                lint: 'eslint . ',
                jest: 'jest',
                format: 'prettier --write .',
                dev: 'nodemon src/main.ts',
                debug: 'nodemon --inspect=0.0.0.0:${DEBUG_PORT} src/main.ts',
                start: 'node dist/main.js',
            },
            author: context.author || '',
            license: context.license || 'ISC',
            dependencies: {
                '@avanzu/decorators': '^1.1.5',
                '@avanzu/kernel': '^1.3.0',
                '@koa/bodyparser': '^5.1.0',
                '@koa/cors': '^5.0.0',
                '@mikro-orm/core': '^6.2.5',
                '@mikro-orm/mongo-highlighter': '^1.0.0',
                '@mikro-orm/mongodb': '^6.2.5',
                '@mikro-orm/reflection': '^6.2.5',
                '@sinclair/typebox': '^0.32.29',
                awilix: '^10.0.2',
                'awilix-manager': '^5.2.1',
                config: '^3.3.11',
                dotenv: '^16.4.5',
                'http-status-codes': '^2.3.0',
                ioredis: '^5.4.1',
                jsonwebtoken: '^9.0.2',
                koa: '^2.15.2',
                'koa-helmet': '^7.0.2',
                'koa-qs': '^3.0.0',
                msgpackr: '^1.10.2',
                pino: '^8.21.0',
            },
            devDependencies: {
                '@mikro-orm/cli': '^6.2.5',
                '@types/config': '^3.3.3',
                '@types/jest': '^29.5.12',
                '@types/jsonwebtoken': '^9.0.6',
                '@types/koa': '^2.15.0',
                '@types/koa__cors': '^5.0.0',
                '@types/koa-router': '^7.4.8',
                '@types/supertest': '^6.0.2',
                axios: '^0.27.2',
                eslint: '^8.12.0',
                'eslint-config-prettier': '^8.5.0',
                'eslint-plugin-prettier': '^4.0.0',
                jest: '^29.7.0',
                'jest-junit': '^13.1.0',
                nodemon: '^3.1.0',
                prettier: '^2.6.2',
                rimraf: '^5.0.5',
                supertest: '^7.0.0',
                testcontainers: '^8.16.0',
                'trace-unhandled': '^2.0.1',
                'ts-jest': '^29.1.2',
                'ts-node': '^10.9.2',
                'tsc-alias': '^1.8.8',
                'tsconfig-paths': '^4.2.0',
                typescript: '^5.4.2',
            },
            'mikro-orm': {
                useTsNode: true,
                configPaths: ['./config/mikro-orm.ts', './config/mikro-orm.js'],
            },
        }

        return JSON.stringify(contents, null, 2)
    }
}
