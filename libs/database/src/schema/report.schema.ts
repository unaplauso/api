/* TODO: Report 
##### REPORT
- id user
- id reportado
- motivo_reporte enum?
- mensaje_opcional
*/

// export const user = pgTable('report', {});

/* 
- INTEGRAR S3 FILES O SIMILAR
- INTEGRAR MP PARA PAGOS
- DASHBOARD ENDPOINT

##### USER
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

##### INTEREST 
- id
- nombre de interes

##### USER_INTEREST*limite 3 per user?*
- id user
- id interest

##### FAVORITES_USER_CREATOR
- userId
- creatorId

##### FAVORITES_USER_PROJECTS
- userId
- projectId

##### PROJECT
- nxn fotos
- nxn interest
- creatorId
- titulo
- objetivoAplauso
- valorAplauso
- deQueTrata
- cualEsElObjetivo
- activo (es borrador o no)

##### APPLAUSE *data mp?*
- id-transaction
- cantidad
- userId
- creatorId / projectId
- mensajeOpcional
- createdAt

##### MATERIALIZED VIEW TOP-10
Usuarios mas ovacionados

##### PROJECT_INTERACTION
Registro algoritmia para vista de proyectos, saber los mas interactuados en el ultimo tiempo
*/
