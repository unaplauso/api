import { Injectable } from '@nestjs/common';
import { User, UserDetail } from '@unaplauso/database';
import { type Database, InjectDB } from '@unaplauso/database/module';
import type { UserAction } from '@unaplauso/validation';
import type { TUpdateUser } from '@unaplauso/validation/types';
import { eq, getTableColumns } from 'drizzle-orm';

@Injectable()
export class UserService {
	constructor(@InjectDB() private readonly db: Database) {}

	async readUser(userId: number) {
		const [userSelection, userDetailSelection] = [
			getTableColumns(User),
			getTableColumns(UserDetail),
		];

		return (
			await this.db
				.select({ ...userSelection, ...userDetailSelection })
				.from(User)
				.leftJoin(UserDetail, eq(UserDetail.id, User.id))
				.where(eq(User.id, userId))
		).at(0);
	}

	async updateUser({
		userId,
		displayName,
		username,
		...details
	}: UserAction<TUpdateUser>) {
		return this.db.transaction(
			async (tx) =>
				await Promise.all([
					(displayName || username) &&
						tx
							.update(User)
							.set({ displayName, username })
							.where(eq(User.id, userId)),
					Object.keys(details).length &&
						tx.update(UserDetail).set(details).where(eq(UserDetail.id, userId)),
				]),
		);
	}
}
