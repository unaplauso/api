import { BaseSchema, BaseIssue } from 'valibot';

export type UnknownBaseSchema = BaseSchema<
  unknown,
  unknown,
  BaseIssue<unknown>
>;
