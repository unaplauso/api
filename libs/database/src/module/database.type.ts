import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '..';

export type Database = NodePgDatabase<typeof schema> & {
  $client: Pool;
};
