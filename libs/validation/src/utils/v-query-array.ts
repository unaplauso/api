import * as v from 'valibot';

export const vQueryArray = <
	const TItem extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(
	item: TItem,
) =>
	v.pipe(
		v.union([v.array(item), item]),
		v.transform((x) => (Array.isArray(x) ? x : [x])),
		v.array(item),
	);
