import { pgTable, serial } from 'drizzle-orm/pg-core';

export const ProjectTable = pgTable('project', {
  id: serial().primaryKey(),
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

##### PROJECT_INTERACTION
Registro algoritmia para vista de proyectos, saber los mas interactuados en el ultimo tiempo
*/
