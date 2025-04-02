import * as v from 'valibot';

export function isDefaultType(schema: v.GenericSchema, obj: object) {
	return (
		JSON.stringify(
			Object.fromEntries(
				Object.entries(obj).filter(([_, value]) => value !== undefined),
			),
		) === JSON.stringify(v.getDefaults(schema))
	);
}
