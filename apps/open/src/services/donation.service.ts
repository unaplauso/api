import { Injectable } from '@nestjs/common';
import {
	CreatorDonation,
	Donation,
	ProjectDonation,
	User,
} from '@unaplauso/database';
import { caseWhenNull, jsonBuildObject } from '@unaplauso/database/functions';
import { ProfilePicFile } from '@unaplauso/database/helpers/aliases';
import { type Database, InjectDB } from '@unaplauso/database/module';
import { DonatorTop } from '@unaplauso/database/schema/donator-top.schema';
import type { CreatorAction, ProjectAction } from '@unaplauso/validation';
import type {
	ListDonation,
	ListTopDonation,
} from '@unaplauso/validation/types';
import { asc, desc, eq, getViewSelectedFields } from 'drizzle-orm';

@Injectable()
export class DonationService {
	constructor(@InjectDB() private readonly db: Database) {}

	async listCreatorDonation(dto: CreatorAction<ListDonation>) {
		return this.db
			.select({
				id: Donation.id,
				createdAt: Donation.createdAt,
				amount: Donation.amount,
				message: Donation.message,
				user: caseWhenNull(
					Donation.userId,
					jsonBuildObject({
						id: User.id,
						username: User.username,
						displayName: User.displayName,
						profilePic: caseWhenNull(
							User.profilePicFileId,
							jsonBuildObject({
								id: ProfilePicFile.id,
								bucket: ProfilePicFile.bucket,
								isNsfw: ProfilePicFile.isNsfw,
							}),
						),
					}),
				),
			})
			.from(CreatorDonation)
			.innerJoin(Donation, eq(Donation.id, CreatorDonation.donationId))
			.leftJoin(User, eq(User.id, Donation.userId))
			.leftJoin(ProfilePicFile, eq(ProfilePicFile.id, User.profilePicFileId))
			.where(eq(CreatorDonation.creatorId, dto.creatorId))
			.orderBy(
				(dto.order === 'asc' ? asc : desc)(
					dto.orderBy === 'value' ? Donation.value : Donation.createdAt,
				),
			)
			.limit(dto.pageSize)
			.offset((dto.page - 1) * dto.pageSize);
	}

	async listTopCreatorDonation(dto: CreatorAction<ListTopDonation>) {
		const {
			creatorId,
			projectId,
			value,
			createdAt,
			profileBanner,
			location,
			personalUrl,
			instagramUser,
			facebookUser,
			xUser,
			tiktokUser,
			githubUser,
			topics,
			topicIds,
			...selection
		} = getViewSelectedFields(DonatorTop);

		return this.db
			.select(selection)
			.from(DonatorTop)
			.where(eq(DonatorTop.creatorId, dto.creatorId))
			.orderBy(desc(DonatorTop.value))
			.limit(dto.pageSize)
			.offset((dto.page - 1) * dto.pageSize);
	}

	async listProjectDonation(dto: ProjectAction<ListDonation>) {
		return this.db
			.select({
				id: Donation.id,
				createdAt: Donation.createdAt,
				amount: Donation.amount,
				message: Donation.message,
				user: caseWhenNull(
					Donation.userId,
					jsonBuildObject({
						id: User.id,
						username: User.username,
						displayName: User.displayName,
						profilePic: caseWhenNull(
							User.profilePicFileId,
							jsonBuildObject({
								id: ProfilePicFile.id,
								bucket: ProfilePicFile.bucket,
								isNsfw: ProfilePicFile.isNsfw,
							}),
						),
					}),
				),
			})
			.from(ProjectDonation)
			.innerJoin(Donation, eq(Donation.id, ProjectDonation.donationId))
			.leftJoin(User, eq(User.id, Donation.userId))
			.leftJoin(ProfilePicFile, eq(ProfilePicFile.id, User.profilePicFileId))
			.where(eq(ProjectDonation.projectId, dto.projectId))
			.orderBy(
				(dto.order === 'asc' ? asc : desc)(
					dto.orderBy === 'value' ? Donation.value : Donation.createdAt,
				),
			)
			.limit(dto.pageSize)
			.offset((dto.page - 1) * dto.pageSize);
	}

	async listTopProjectDonation(dto: ProjectAction<ListTopDonation>) {
		const {
			creatorId,
			projectId,
			value,
			createdAt,
			profileBanner,
			location,
			personalUrl,
			instagramUser,
			facebookUser,
			xUser,
			tiktokUser,
			githubUser,
			topics,
			topicIds,
			...selection
		} = getViewSelectedFields(DonatorTop);

		return this.db
			.select(selection)
			.from(DonatorTop)
			.where(eq(DonatorTop.projectId, dto.projectId))
			.orderBy(desc(DonatorTop.value))
			.limit(dto.pageSize)
			.offset((dto.page - 1) * dto.pageSize);
	}
}
