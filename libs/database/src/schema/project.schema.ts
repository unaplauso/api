import { pgTable, serial, timestamp } from 'drizzle-orm/pg-core';

export const ProjectTable = pgTable('project', {
  id: serial().primaryKey(),
  createdAt: timestamp().notNull().defaultNow(),
});

/*
##### PROJECT
- nxn fotos
- nxn topic
- creatorId
- titulo
- objetivoAplauso
- valorAplauso
- deQueTrata
- cualEsElObjetivo
- activo (es borrador o no)
- esBorrador
*/
