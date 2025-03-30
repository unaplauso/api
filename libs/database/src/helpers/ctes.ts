import { eq, sum } from 'drizzle-orm';
import type { QueryBuilder } from 'drizzle-orm/pg-core';
import { arrayAgg, jsonAgg, jsonBuildObject } from '../functions';
import { Donation } from '../schema/donation.schema';
import { File } from '../schema/file.schema';
import { ProjectDonation } from '../schema/project-donation.schema';
import { ProjectFile } from '../schema/project-file.schema';
import { ProjectTopic } from '../schema/project-topic.schema';
import { Topic } from '../schema/topic.schema';

export const BuildProjectTopicCte = (qb: QueryBuilder) =>
	qb.$with('project_topic_cte').as((sqb) =>
		sqb
			.select({
				projectId: ProjectTopic.projectId,
				topics: jsonAgg(jsonBuildObject({ id: Topic.id, name: Topic.name })).as(
					'topics',
				),
				topicIds: arrayAgg(Topic.id).as('topic_ids'),
			})
			.from(ProjectTopic)
			.innerJoin(Topic, eq(Topic.id, ProjectTopic.topicId))
			.groupBy(ProjectTopic.projectId),
	);

export const BuildProjectDonationCte = (qb: QueryBuilder) =>
	qb.$with('project_donation_cte').as((sqb) =>
		sqb
			.select({
				projectId: ProjectDonation.projectId,
				amount: sum(Donation.amount).as('amount'),
				value: sum(Donation.value).as('value'),
			})
			.from(ProjectDonation)
			.innerJoin(Donation, eq(Donation.id, ProjectDonation.projectId))
			.groupBy(ProjectDonation.projectId),
	);

export const BuildProjectFileCte = (qb: QueryBuilder) =>
	qb.$with('project_file_cte').as((sqb) =>
		sqb
			.select({
				projectId: ProjectFile.projectId,
				files: jsonAgg(
					jsonBuildObject({ id: File.id, isNsfw: File.isNsfw }),
				).as('files'),
			})
			.from(ProjectFile)
			.innerJoin(File, eq(File.id, ProjectFile.fileId))
			.groupBy(ProjectFile.projectId),
	);
