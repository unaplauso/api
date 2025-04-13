import { eq, sum } from 'drizzle-orm';
import { pgView } from 'drizzle-orm/pg-core';
import {
	arrayAgg,
	caseWhenNull,
	coalesce,
	jsonAgg,
	jsonBuildObject,
	sqlJsonArray,
	sqlNull,
	sqlSmallintArray,
} from '../functions';
import {
	ProfileBannerFile,
	ProfilePicFile,
	aliasedColumn,
	aliasedNullableColumn,
} from '../helpers/aliases';
import { CreatorDonation } from './creator-donation.schema';
import { Donation } from './donation.schema';
import { ProjectDonation } from './project-donation.schema';
import { Topic } from './topic.schema';
import { UserDetail } from './user-detail.schema';
import { UserTopic } from './user-topic.schema';
import { User } from './user.schema';

export const DonatorTop = pgView('donator_top').as((qb) => {
	const DonationCte = qb.$with('creator_donation_cte').as((sqb) =>
		sqb
			.select({
				userId: Donation.userId,
				creatorId: aliasedNullableColumn(
					CreatorDonation.creatorId,
					'creator_id',
				),
				projectId: sqlNull<number>('project_id'),
				amount: sum(Donation.amount).as('amount'),
				value: sum(Donation.value).as('value'),
			})
			.from(CreatorDonation)
			.innerJoin(Donation, eq(Donation.id, CreatorDonation.donationId))
			.groupBy(Donation.userId, CreatorDonation.creatorId)
			.unionAll(
				sqb
					.select({
						userId: Donation.userId,
						creatorId: sqlNull<number>('creator_id'),
						projectId: aliasedNullableColumn(
							ProjectDonation.projectId,
							'project_id',
						),
						amount: sum(Donation.amount).as('amount'),
						value: sum(Donation.value).as('value'),
					})
					.from(ProjectDonation)
					.innerJoin(Donation, eq(Donation.id, ProjectDonation.donationId))
					.groupBy(Donation.userId, ProjectDonation.projectId),
			),
	);

	const UserTopicCte = qb.$with('user_topic_cte').as((sqb) =>
		sqb
			.select({
				userId: UserTopic.userId,
				topics: jsonAgg(jsonBuildObject({ id: Topic.id, name: Topic.name })).as(
					'topics',
				),
				topicIds: arrayAgg(Topic.id).as('topic_ids'),
			})
			.from(UserTopic)
			.innerJoin(Topic, eq(Topic.id, UserTopic.topicId))
			.groupBy(UserTopic.userId),
	);

	return qb
		.with(DonationCte, UserTopicCte)
		.select({
			id: User.id,
			creatorId: aliasedColumn(DonationCte.creatorId, 'creator_id'),
			projectId: aliasedColumn(DonationCte.projectId, 'project_id'),
			amount: DonationCte.amount,
			value: DonationCte.value,
			username: User.username,
			displayName: aliasedColumn(User.displayName, 'display_name'),
			createdAt: User.createdAt,
			profilePic: caseWhenNull(
				User.profilePicFileId,
				jsonBuildObject({
					id: ProfilePicFile.id,
					bucket: ProfilePicFile.bucket,
					isNsfw: ProfilePicFile.isNsfw,
				}),
			).as('profile_pic'),
			profileBanner: caseWhenNull(
				User.profileBannerFileId,
				jsonBuildObject({
					id: ProfileBannerFile.id,
					bucket: ProfileBannerFile.bucket,
					isNsfw: ProfileBannerFile.isNsfw,
				}),
			).as('profile_banner'),
			location: aliasedColumn(UserDetail.location, 'location'),
			personalUrl: aliasedColumn(UserDetail.personalUrl, 'personal_url'),
			instagramUser: aliasedColumn(UserDetail.instagramUser, 'instagram_user'),
			facebookUser: aliasedColumn(UserDetail.facebookUser, 'facebook_user'),
			xUser: aliasedColumn(UserDetail.xUser, 'x_user'),
			tiktokUser: aliasedColumn(UserDetail.tiktokUser, 'tiktok_user'),
			githubUser: aliasedColumn(UserDetail.githubUser, 'github_user'),
			topics: coalesce(UserTopicCte.topics, sqlJsonArray).as('topics'),
			topicIds: coalesce(UserTopicCte.topicIds, sqlSmallintArray).as(
				'topic_ids',
			),
		})
		.from(User)
		.innerJoin(UserDetail, eq(UserDetail.id, User.id))
		.leftJoin(ProfilePicFile, eq(ProfilePicFile.id, User.profilePicFileId))
		.leftJoin(
			ProfileBannerFile,
			eq(ProfileBannerFile.id, User.profileBannerFileId),
		)
		.innerJoin(DonationCte, eq(DonationCte.userId, User.id))
		.leftJoin(UserTopicCte, eq(UserTopicCte.userId, User.id));
});
