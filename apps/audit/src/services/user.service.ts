import { Injectable } from '@nestjs/common';
import {
	User,
	UserDetail,
	UserIntegration,
	UserTopic,
} from '@unaplauso/database';
import { type Database, InjectDB } from '@unaplauso/database/module';
import type { UserAction } from '@unaplauso/validation';
import type { UpdateUser } from '@unaplauso/validation/types';
import { and, eq, getTableColumns, inArray } from 'drizzle-orm';

@Injectable()
export class UserService {
	constructor(@InjectDB() private readonly db: Database) {}

	async readUser(userId: number) {
		return (
			await this.db
				.select({
					...getTableColumns(User),
					...getTableColumns(UserDetail),
					...getTableColumns(UserIntegration),
				})
				.from(User)
				.innerJoin(UserDetail, eq(UserDetail.id, User.id))
				.innerJoin(UserIntegration, eq(UserIntegration.id, User.id))
				.where(eq(User.id, userId))
		).at(0);
	}

	async updateUser({
		userId,
		displayName,
		username,
		addTopicIds,
		removeTopicIds,
		...details
	}: UserAction<UpdateUser>) {
		return this.db.transaction(async (tx) =>
			Promise.all([
				(displayName || username) &&
					tx
						.update(User)
						.set({ displayName, username })
						.where(eq(User.id, userId)),
				Object.keys(details).length &&
					tx.update(UserDetail).set(details).where(eq(UserDetail.id, userId)),
				removeTopicIds.length &&
					tx
						.delete(UserTopic)
						.where(
							and(
								inArray(UserTopic.topicId, removeTopicIds),
								eq(UserTopic.userId, userId),
							),
						),
				addTopicIds.length &&
					tx
						.insert(UserTopic)
						.values(addTopicIds.map((t) => ({ topicId: t, userId })))
						.onConflictDoNothing(),
			]),
		);
	}
}
