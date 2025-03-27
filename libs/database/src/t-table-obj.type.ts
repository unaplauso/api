import type { Column, SQL } from 'drizzle-orm';

export type TTableObj<T = unknown> = Column | SQL<T> | SQL.Aliased<T>;
