import { defineConfig } from '@mikro-orm/mongodb';
import { MongoHighlighter } from '@mikro-orm/mongo-highlighter';
import { User } from '~/domain/entities';

export default defineConfig({
  entities: [User],
  dbName: 'authentication',
  highlighter: new MongoHighlighter(),
  debug: true
});