import { sql } from 'drizzle-orm';

export const sqlArray = <T extends unknown[]>(x: T, parseTo?: string) => {
	const chunks = x.map((v) => sql`${v}`);
	const q = sql<T>`ARRAY[${sql.join(chunks, sql.raw(','))}]`;
	if (parseTo) q.append(sql`::${sql.raw(parseTo)}[]`);
	return q;
};
