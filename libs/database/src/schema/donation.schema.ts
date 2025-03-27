import Big from 'big.js';
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
import { UserTable } from './user.schema';

export const DonationTable = pgTable('donation', {
	id: bigserial({ mode: 'number' }).primaryKey(),
	userId: integer().references(() => UserTable.id, { onDelete: 'set null' }),
	message: varchar({ length: 500 }),
	createdAt: timestamp().notNull().defaultNow(),
	quotation: numeric().notNull().default(Big(1).toPrecision()),
	amount: numeric().notNull(),
	realValue: numeric()
		.notNull()
		.generatedAlwaysAs(
			(): SQL => sql`${DonationTable.amount} * ${DonationTable.quotation}`,
		),
	transactionData: json(),
});
