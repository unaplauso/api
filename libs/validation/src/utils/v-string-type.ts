import * as v from 'valibot';

export const vStringInt = v.pipe(
  v.union([v.string(), v.number()]),
  v.transform(parseInt),
  v.integer(),
);

export const vStringFloat = v.pipe(
  v.union([v.string(), v.number()]),
  v.transform(parseFloat),
);
