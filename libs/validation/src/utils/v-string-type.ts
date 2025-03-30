import * as v from 'valibot';

export const vStringInt = v.pipe(
	v.union([v.string(), v.number()]),
	v.transform(Number.parseInt),
	v.integer(),
);

export const vStringFloat = v.pipe(
	v.union([v.string(), v.number()]),
	v.check((x) => Boolean(Number.parseFloat(x.toString()))),
	v.transform(String),
);

export const vStringBoolean = v.pipe(
	v.union([v.picklist(['true', 'false'] as const), v.boolean()]),
	v.transform((x) => x !== 'false' && Boolean(x)),
);
