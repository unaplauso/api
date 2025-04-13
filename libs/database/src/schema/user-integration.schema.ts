import { integer, numeric, pgTable, varchar } from 'drizzle-orm/pg-core';
import { User } from './user.schema';

export const UserIntegration = pgTable('user_integration', {
	id: integer()
		.notNull()
		.primaryKey()
		.references(() => User.id, { onDelete: 'cascade' }),
	fee: numeric().notNull().default('0.05'),
	mercadoPagoRefreshToken: varchar({ length: 512 }),
});
