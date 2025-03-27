import { integer, pgTable } from 'drizzle-orm/pg-core';
import { DonationTable } from './donation.schema';
import { ProjectTable } from './project.schema';

export const ProjectDonationTable = pgTable('project_donation', {
	donationId: integer()
		.notNull()
		.primaryKey()
		.references(() => DonationTable.id, { onDelete: 'cascade' }),
	projectId: integer()
		.notNull()
		.references(() => ProjectTable.id, { onDelete: 'set null' }),
});
