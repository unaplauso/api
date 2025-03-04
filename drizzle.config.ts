import { Config, defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  casing: 'snake_case',

  schema: './libs/database/src/schema/**/*',
  out: './libs/database/migrations',

  migrations: {
    prefix: 'timestamp',
    table: '__migrations',
    schema: 'public',
  },

  breakpoints: false,
  strict: true,

  // extensionsFilters: ['postgis'],

  dbCredentials: {
    host: process.env.POSTGRES_HOST ?? '127.0.0.1',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    user: process.env.POSTGRES_USER ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB ?? 'un_aplauso',
    ssl: false,
  },
}) satisfies Config;
