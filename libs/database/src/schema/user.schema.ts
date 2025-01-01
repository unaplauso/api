import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-valibot';
import { email, InferInput, pipe } from 'valibot';

export const UserTable = pgTable('user', {
  id: serial('id').primaryKey(),
  username: varchar({ length: 64 }).unique(),
  email: varchar({ length: 320 }).unique().notNull(),
});

export const InsertUserSchema = createInsertSchema(UserTable, {
  email: (schema) => pipe(schema, email()),
});

export type InsertUser = InferInput<typeof InsertUserSchema>;

/* 
##### USER
name: varchar({ length: 128 }),
- url personal
- ubicacion
- fotoId
- fotoBannerId
- biografia TEXT
- datetime de ultima vista de notificaciones
- mail
- agradecimientoPersonalizado, para cuando te donan
- escondeFavoritos boolean
- URLs de redes sociales
- valorAplauso
*/
