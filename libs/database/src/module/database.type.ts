import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';
import type * as schema from '..';

export type Database = NodePgDatabase<typeof schema> & {
	$client: Pool;
};
