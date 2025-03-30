import { integer, pgTable } from 'drizzle-orm/pg-core';
import { Donation } from './donation.schema';
import { Project } from './project.schema';

export const ProjectDonation = pgTable('project_donation', {
	donationId: integer()
		.notNull()
		.primaryKey()
		.references(() => Donation.id, { onDelete: 'cascade' }),
	projectId: integer()
		.notNull()
		.references(() => Project.id, { onDelete: 'set null' }),
});
