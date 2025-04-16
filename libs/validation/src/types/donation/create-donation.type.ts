import { vStringFloat } from '@unaplauso/validation/utils';
import * as v from 'valibot';

export const CreateDonationSchema = v.strictObject({
	quantity: vStringFloat,
	message: v.optional(v.pipe(v.string(), v.maxLength(500))),
});

export type CreateDonation = v.InferOutput<typeof CreateDonationSchema>;
