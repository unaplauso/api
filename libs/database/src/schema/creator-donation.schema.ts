import { integer, pgTable } from 'drizzle-orm/pg-core';
import { DonationTable } from './donation.schema';
import { UserTable } from './user.schema';

export const CreatorDonationTable = pgTable('creator_donation', {
	donationId: integer()
		.notNull()
		.primaryKey()
		.references(() => DonationTable.id, { onDelete: 'cascade' }),
	creatorId: integer()
		.notNull()
		.references(() => UserTable.id, { onDelete: 'set null' }),
});
