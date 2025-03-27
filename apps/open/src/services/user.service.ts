import { Injectable } from '@nestjs/common';
import { UserTable } from '@unaplauso/database';
import { lowerEq } from '@unaplauso/database/functions';
import { type Database, InjectDB } from '@unaplauso/database/module';
import { eq } from 'drizzle-orm';

@Injectable()
export class UserService {
	constructor(@InjectDB() private readonly db: Database) {}

	async readUserProfilePic(userId: number) {
		return (
			await this.db
				.select({ id: UserTable.profilePicFileId })
				.from(UserTable)
				.where(eq(UserTable.id, userId))
		).at(0)?.id;
	}

	async readUserProfileBanner(userId: number) {
		return (
			await this.db
				.select({ id: UserTable.profileBannerFileId })
				.from(UserTable)
				.where(eq(UserTable.id, userId))
		).at(0)?.id;
	}

	async readUserExists(username: string) {
		return Boolean(
			(
				await this.db
					.select({ id: UserTable.id })
					.from(UserTable)
					.where(lowerEq(UserTable.username, username))
			).at(0)?.id,
		);
	}
}
