import { type SQL, sql } from 'drizzle-orm';
import {
	bigserial,
	integer,
	json,
	numeric,
	pgTable,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';
import { User } from './user.schema';

export const Donation = pgTable('donation', {
	id: bigserial({ mode: 'number' }).primaryKey(),
	userId: integer().references(() => User.id, { onDelete: 'set null' }),
	message: varchar({ length: 500 }),
	createdAt: timestamp().notNull().defaultNow(),
	quotation: numeric().notNull().default('1'),
	amount: numeric().notNull(),
	value: numeric()
		.notNull()
		.generatedAlwaysAs(
			(): SQL => sql`${Donation.amount} * ${Donation.quotation}`,
		),
	transactionData: json(),
});
