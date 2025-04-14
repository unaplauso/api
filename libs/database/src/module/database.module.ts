import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as schema from '..';
import { IS_DEVELOPMENT } from '@unaplauso/validation';

export const DATABASE_CONNECTION = 'database_connection';

@Global()
@Module({
	providers: [
		{
			provide: DATABASE_CONNECTION,
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => {
				const db = drizzle(
					new Pool({
						host: configService.get('POSTGRES_HOST', '127.0.0.1'),
						database: configService.get('POSTGRES_DB'),
						user: configService.get('POSTGRES_USER'),
						password: configService.getOrThrow('POSTGRES_PASSWORD'),
						port: configService.get('POSTGRES_PORT', 5432),
					}),
					{
						casing: 'snake_case',
						logger: IS_DEVELOPMENT,
						schema,
					},
				);

				await migrate(db, {
					migrationsFolder: './libs/database/migrations',
					migrationsSchema: 'public',
					migrationsTable: '__migrations',
				});

				return db;
			},
		},
	],
	exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
