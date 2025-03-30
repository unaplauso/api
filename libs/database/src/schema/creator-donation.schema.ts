import { integer, pgTable } from 'drizzle-orm/pg-core';
import { Donation } from './donation.schema';
import { User } from './user.schema';

export const CreatorDonation = pgTable('creator_donation', {
	donationId: integer()
		.notNull()
		.primaryKey()
		.references(() => Donation.id, { onDelete: 'cascade' }),
	creatorId: integer()
		.notNull()
		.references(() => User.id, { onDelete: 'set null' }),
});
