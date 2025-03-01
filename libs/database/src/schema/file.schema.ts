import { pgEnum, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-valibot';
import * as v from 'valibot';

export enum FileType {
  PROFILE_PIC = 'profile_pic',
  PROFILE_BANNER = 'profile_banner',
}

export const FileTypeEnum = pgEnum(
  'file_type',
  Object.values(FileType) as [FileType],
);

export const FileTable = pgTable('file', {
  id: uuid().notNull().primaryKey().defaultRandom(),
  type: FileTypeEnum().notNull(),
  mimetype: varchar({ length: 96 }),
});

export const InsertFileSchema = createInsertSchema(FileTable);

export type InsertFile = v.InferInput<typeof InsertFileSchema>;
