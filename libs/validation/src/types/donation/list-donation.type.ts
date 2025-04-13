import * as v from 'valibot';
import { CreatePaginationSchema } from '../pagination.type';

export const ListDonationSchema = v.omit(
	CreatePaginationSchema(['createdAt', 'value'], {
		pageSize: 10,
		order: 'desc',
	}),
	['search'],
);

export type ListDonation = v.InferOutput<typeof ListDonationSchema>;
