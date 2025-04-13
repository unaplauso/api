import { eq, getViewSelectedFields, isNotNull, sum } from 'drizzle-orm';
import { pgMaterializedView, pgView } from 'drizzle-orm/pg-core';
import {
	arrayAgg,
	caseWhenNull,
	coalesce,
	jsonAgg,
	jsonBuildObject,
	sqlFalse,
	sqlJsonArray,
	sqlSmallintArray,
	sqlStr0,
	sqlTrue,
} from '../functions';
import {
	ProfileBannerFile,
	ProfilePicFile,
	aliasedColumn,
} from '../helpers/aliases';
import { countWhereSq } from '../helpers/subqueries';
import { CreatorDonation } from './creator-donation.schema';
import { CreatorInteraction } from './creator-interaction.schema';
import { Donation } from './donation.schema';
import { FavoriteCreator } from './favorite-creator.schema';
import { Topic } from './topic.schema';
import { UserDetail } from './user-detail.schema';
import { UserIntegration } from './user-integration.schema';
import { UserTopic } from './user-topic.schema';
import { User } from './user.schema';

export const CreatorTop = pgView('creator_top').as((qb) => {
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

	const CreatorDonationCte = qb.$with('creator_donation_cte').as((sqb) =>
		sqb
			.select({
				creatorId: CreatorDonation.creatorId,
				amount: sum(Donation.amount).as('amount'),
				value: sum(Donation.value).as('value'),
			})
			.from(CreatorDonation)
			.innerJoin(Donation, eq(Donation.id, CreatorDonation.creatorId))
			.groupBy(CreatorDonation.creatorId),
	);

	return qb
		.with(UserTopicCte, CreatorDonationCte)
		.select({
			id: User.id,
			username: User.username,
			displayName: aliasedColumn(User.displayName, 'display_name'),
			createdAt: aliasedColumn(User.createdAt, 'created_at'),
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
			description: aliasedColumn(UserDetail.description, 'description'),
			customThanks: aliasedColumn(UserDetail.customThanks, 'custom_thanks'),
			location: aliasedColumn(UserDetail.location, 'location'),
			quotation: aliasedColumn(UserDetail.quotation, 'quotation'),
			personalUrl: aliasedColumn(UserDetail.personalUrl, 'personal_url'),
			instagramUser: aliasedColumn(UserDetail.instagramUser, 'instagram_user'),
			facebookUser: aliasedColumn(UserDetail.facebookUser, 'facebook_user'),
			xUser: aliasedColumn(UserDetail.xUser, 'x_user'),
			tiktokUser: aliasedColumn(UserDetail.tiktokUser, 'tiktok_user'),
			githubUser: aliasedColumn(UserDetail.githubUser, 'github_user'),
			donationsAmount: coalesce(CreatorDonationCte.amount, sqlStr0).as(
				'donations_amount',
			),
			donationsValue: coalesce(CreatorDonationCte.value, sqlStr0).as(
				'donations_value',
			),
			hasMercadoPago: coalesce(
				caseWhenNull(UserIntegration.mercadoPagoRefreshToken, sqlTrue),
				sqlFalse,
			).as('has_mercado_pago'),
			favorites: countWhereSq(
				FavoriteCreator,
				eq(FavoriteCreator.creatorId, User.id),
			).as('favorites'),
			topics: coalesce(UserTopicCte.topics, sqlJsonArray).as('topics'),
			topicIds: coalesce(UserTopicCte.topicIds, sqlSmallintArray).as(
				'topic_ids',
			),
			interactions: countWhereSq(
				CreatorInteraction,
				eq(CreatorInteraction.creatorId, User.id),
			).as('interactions'),
		})
		.from(User)
		.innerJoin(UserDetail, eq(UserDetail.id, User.id))
		.innerJoin(UserIntegration, eq(UserIntegration.id, User.id))
		.leftJoin(ProfilePicFile, eq(ProfilePicFile.id, User.profilePicFileId))
		.leftJoin(
			ProfileBannerFile,
			eq(ProfileBannerFile.id, User.profileBannerFileId),
		)
		.leftJoin(UserTopicCte, eq(UserTopicCte.userId, User.id))
		.leftJoin(CreatorDonationCte, eq(CreatorDonationCte.creatorId, User.id));
});

export const CreatorTopMv = pgMaterializedView('creator_top_mv').as((qb) => {
	const {
		description,
		customThanks,
		location,
		quotation,
		personalUrl,
		instagramUser,
		facebookUser,
		xUser,
		tiktokUser,
		githubUser,
		hasMercadoPago,
		...selection
	} = getViewSelectedFields(CreatorTop);

	return qb
		.select(selection)
		.from(CreatorTop)
		.where(isNotNull(CreatorTop.username));
});

/* INDEXES 
- creator_top_mv_id_idx
- creator_top_mv_topic_ids_idx
- creator_top_mv_donations_value_idx
- creator_top_mv_interactions_idx
*/
