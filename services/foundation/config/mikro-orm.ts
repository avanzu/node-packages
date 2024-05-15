import { defineConfig } from '@mikro-orm/mongodb'
import { MongoHighlighter } from '@mikro-orm/mongo-highlighter'
import { Migrator } from '@mikro-orm/migrations-mongodb'

export default defineConfig({
    clientUrl: process.env.MONGO_URL,
    dbName: process.env.MONGO_DBNAME || 'foundation',
    password: process.env.MONGO_PASSWD,
    user: process.env.MONGO_USER,
    tsNode: true,
    entitiesTs: ['./src/domain/entities'],
    entities: ['./dist/domain/entities'],
    highlighter: new MongoHighlighter(),
    debug: process.env.NODE_ENV === 'development',
    extensions: [Migrator],
    ensureIndexes: false,
    migrations: {
        transactional: false,
        path: './dist/infrastructure/migrations',
        pathTs: './src/infrastructure/migrations',
        snapshot: true,
    },
})
