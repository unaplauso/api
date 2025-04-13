import * as v from 'valibot';
import { CreatePaginationSchema } from '../pagination.type';

export const ListTopDonationSchema = v.omit(
	CreatePaginationSchema([], {
		pageSize: 5,
		order: 'desc',
	}),
	['search', 'order', 'orderBy'],
);

export type ListTopDonation = v.InferOutput<typeof ListTopDonationSchema>;
