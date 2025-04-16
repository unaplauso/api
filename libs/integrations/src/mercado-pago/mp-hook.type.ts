import * as v from 'valibot';

export const MpHookSchema = v.looseObject({
	action: v.literal('payment.created'),
	data: v.looseObject({ id: v.string() }),
	date_created: v.pipe(
		v.string(),
		v.isoTimestamp(),
		v.transform((x) => new Date(x)),
	),
});

export type MpHook = v.InferOutput<typeof MpHookSchema>;
