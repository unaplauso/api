import { Injectable } from '@nestjs/common';
import { UserDetailTable, UserTable } from '@unaplauso/database';
import { type Database, InjectDB } from '@unaplauso/database/module';
import type { UserAction } from '@unaplauso/validation';
import type { TUpdateUser } from '@unaplauso/validation/types';
import { eq } from 'drizzle-orm';

@Injectable()
export class UserService {
	constructor(@InjectDB() private readonly db: Database) {}

	async updateUser({
		userId,
		displayName,
		username,
		...details
	}: UserAction<TUpdateUser>) {
		// FIXME: Tira dos queries?
		// Terminar & refinar
		return this.db.transaction(
			async (tx) =>
				await Promise.all([
					(displayName || username) &&
						tx
							.update(UserTable)
							.set({ displayName, username })
							.where(eq(UserTable.id, userId)),
					Object.keys(details).length &&
						tx
							.update(UserDetailTable)
							.set(details)
							.where(eq(UserDetailTable.id, userId)),
				]),
		);
	}
}
