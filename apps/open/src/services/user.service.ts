import { Injectable } from '@nestjs/common';
import { User } from '@unaplauso/database';
import { lowerEq } from '@unaplauso/database/functions';
import { type Database, InjectDB } from '@unaplauso/database/module';
import { eq } from 'drizzle-orm';

@Injectable()
export class UserService {
	constructor(@InjectDB() private readonly db: Database) {}

	async readUserProfilePic(userId: number) {
		return (
			await this.db
				.select({ id: User.profilePicFileId })
				.from(User)
				.where(eq(User.id, userId))
		).at(0)?.id;
	}

	async readUserProfileBanner(userId: number) {
		return (
			await this.db
				.select({ id: User.profileBannerFileId })
				.from(User)
				.where(eq(User.id, userId))
		).at(0)?.id;
	}

	async readUserExists(username: string) {
		return Boolean(
			(
				await this.db
					.select({ id: User.id })
					.from(User)
					.where(lowerEq(User.username, username))
			).at(0)?.id,
		);
	}
}
