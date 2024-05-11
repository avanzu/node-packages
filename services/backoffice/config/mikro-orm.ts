import { defineConfig } from '@mikro-orm/mongodb';
import { MongoHighlighter } from '@mikro-orm/mongo-highlighter';


export default defineConfig({
  clientUrl: process.env.MONGO_URL,
  dbName: process.env.MONGO_DBNAME || 'foundation',
  password: process.env.MONGO_ROOT_PASSWD,
  user: process.env.MONGO_ROOT_USER,
  entities: ['./dist/domain/entities'],
  entitiesTs: ['./src/domain/entities'],
  highlighter: new MongoHighlighter(),
  debug: process.env.NODE_ENV === 'development'
})