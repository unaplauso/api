create extension pg_trgm;

CREATE TYPE "public"."file_type" AS ENUM('profile_pic', 'profile_banner');
CREATE TYPE "public"."report_creator_reason" AS ENUM('spam', 'fraud', 'tos_disrespect', 'stolen_content');
CREATE TYPE "public"."report_project_reason" AS ENUM('spam', 'fraud', 'tos_disrespect', 'stolen_content');
CREATE TABLE "favorite_creator" (
	"user_id" integer NOT NULL,
	"creator_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "favorite_creator_user_id_creator_id_pk" PRIMARY KEY("user_id","creator_id")
);

CREATE TABLE "favorite_project" (
	"user_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "favorite_project_user_id_project_id_pk" PRIMARY KEY("user_id","project_id")
);

CREATE TABLE "file" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "file_type" NOT NULL,
	"mimetype" varchar(96),
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "project_interaction" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "project_topic" (
	"project_id" integer NOT NULL,
	"topic_id" integer NOT NULL,
	CONSTRAINT "project_topic_project_id_topic_id_pk" PRIMARY KEY("project_id","topic_id")
);

CREATE TABLE "project" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "report_creator" (
	"user_id" integer NOT NULL,
	"creator_id" integer NOT NULL,
	"reason" "report_creator_reason",
	"message" varchar(500),
	CONSTRAINT "report_creator_user_id_creator_id_pk" PRIMARY KEY("user_id","creator_id"),
	CONSTRAINT "reason_or_message_check" CHECK ("report_creator"."reason" IS NOT NULL OR "report_creator"."message" IS NOT NULL)
);

CREATE TABLE "report_project" (
	"user_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"reason" "report_project_reason",
	"message" varchar(500),
	CONSTRAINT "report_project_user_id_project_id_pk" PRIMARY KEY("user_id","project_id"),
	CONSTRAINT "reason_or_message_check" CHECK ("report_project"."reason" IS NOT NULL OR "report_project"."message" IS NOT NULL)
);

CREATE TABLE "topic" (
	"id" "smallserial" PRIMARY KEY NOT NULL,
	"name" varchar(32) NOT NULL,
	"aliases" varchar(320) NOT NULL,
	CONSTRAINT "topic_name_unique" UNIQUE("name")
);

CREATE TABLE "user_interaction" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "user_topic" (
	"user_id" integer NOT NULL,
	"topic_id" integer NOT NULL,
	CONSTRAINT "user_topic_user_id_topic_id_pk" PRIMARY KEY("user_id","topic_id")
);

CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(64),
	"email" varchar(320) NOT NULL,
	"profile_pic_file_id" uuid,
	"profile_banner_file_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "username_format_check" CHECK ("user"."username" ~ '^[a-zA-Z0-9_-]+$')
);

ALTER TABLE "favorite_creator" ADD CONSTRAINT "favorite_creator_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "favorite_creator" ADD CONSTRAINT "favorite_creator_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "favorite_project" ADD CONSTRAINT "favorite_project_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "favorite_project" ADD CONSTRAINT "favorite_project_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "project_interaction" ADD CONSTRAINT "project_interaction_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "project_topic" ADD CONSTRAINT "project_topic_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "project_topic" ADD CONSTRAINT "project_topic_topic_id_topic_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topic"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "report_creator" ADD CONSTRAINT "report_creator_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "report_creator" ADD CONSTRAINT "report_creator_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "report_project" ADD CONSTRAINT "report_project_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "report_project" ADD CONSTRAINT "report_project_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_interaction" ADD CONSTRAINT "user_interaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_topic" ADD CONSTRAINT "user_topic_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_topic" ADD CONSTRAINT "user_topic_topic_id_topic_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topic"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user" ADD CONSTRAINT "user_profile_pic_file_id_file_id_fk" FOREIGN KEY ("profile_pic_file_id") REFERENCES "public"."file"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "user" ADD CONSTRAINT "user_profile_banner_file_id_file_id_fk" FOREIGN KEY ("profile_banner_file_id") REFERENCES "public"."file"("id") ON DELETE set null ON UPDATE no action;
CREATE INDEX "topic_aliases_trgm" ON "topic" USING gin ("aliases" gin_trgm_ops);
CREATE UNIQUE INDEX "topic_name_unique_lower" ON "topic" USING btree (lower("name"));
CREATE UNIQUE INDEX "user_username_unique_lower" ON "user" USING btree (lower("username"));
CREATE INDEX "user_username_trgm" ON "user" USING gist ("username" gist_trgm_ops);
CREATE UNIQUE INDEX "user_email_unique_lower" ON "user" USING btree (lower("email"));

INSERT INTO topic ("name", "aliases") VALUES
('Tecnología', 'tecnologia,tech,innovacion,gadgets,dispositivos,hardware'),
('Salud', 'salud,bienestar,medicina,fitness,nutricion'),
('Educación', 'educacion,aprendizaje,cursos,formacion,conocimiento'),
('Arte', 'arte,pintura,escultura,musica,dibujo'),
('Música', 'musica,conciertos,bandas,instrumentos,melodias'),
('Cine', 'cine,peliculas,documentales,cortometrajes,actores'),
('Literatura', 'literatura,libros,novelas,poesia,cuentos'),
('Videojuegos', 'videojuegos,juegos,gaming,esports,consolas'),
('Deportes', 'deportes,futbol,baloncesto,tenis,natacion'),
('Moda', 'moda,ropa,estilo,tendencias,diseño'),
('Comida', 'comida,gastronomia,recetas,cocina,restaurantes'),
('Viajes', 'viajes,turismo,destinos,aventura,exploracion'),
('Medio Ambiente', 'medio ambiente,ecologia,sostenibilidad,naturaleza,conservacion'),
('Animales', 'animales,mascotas,fauna,flora,conservacion'),
('Ciencia', 'ciencia,investigacion,experimentos,descubrimientos,teoria'),
('Historia', 'historia,eventos,civilizaciones,arqueologia,pasado'),
('Filosofía', 'filosofia,pensamiento,etica,moral,existencia'),
('Psicología', 'psicologia,mente,comportamiento,emociones,terapia'),
('Negocios', 'negocios,emprendimiento,finanzas,marketing,inversion'),
('Marketing', 'marketing,publicidad,redes sociales,estrategia,ventas'),
('Finanzas', 'finanzas,inversiones,ahorro,presupuesto,economia'),
('Emprendimiento', 'emprendimiento,startups,innovacion,creatividad,liderazgo'),
('Software', 'software,programacion,desarrollo,aplicaciones,codigo'),
('Hardware', 'hardware,componentes,electronica,dispositivos,tecnologia'),
('Robótica', 'robotica,robots,automatizacion,ingenieria,inteligencia artificial'),
('Inteligencia Artificial', 'inteligencia artificial,ia,machine learning,deep learning,redes neuronales'),
('Realidad Virtual', 'realidad virtual,rv,virtual reality,inmersion,simulacion'),
('Realidad Aumentada', 'realidad aumentada,ra,augmented reality,interaccion,superposicion'),
('Blockchain', 'blockchain,criptomonedas,bitcoin,ethereum,descentralizacion'),
('Ciberseguridad', 'ciberseguridad,seguridad informatica,hacking,proteccion,privacidad'),
('Diseño', 'diseno,grafico,web,ux,ui'),
('Fotografía', 'fotografia,imagenes,camaras,iluminacion,composicion'),
('Animación', 'animacion,dibujos animados,3d,motion graphics,personajes'),
('Arquitectura', 'arquitectura,edificios,diseño urbano,construccion,espacios'),
('Jardinería', 'jardineria,plantas,flores,paisajismo,cultivo'),
('Mascotas', 'mascotas,perros,gatos,animales de compañia,cuidados'),
('Automóviles', 'automoviles,coches,vehiculos,motores,transporte'),
('Motocicletas', 'motocicletas,motos,vehiculos de dos ruedas,velocidad,aventura'),
('Relojes', 'relojes,tiempo,hora,diseño,precision'),
('Joyería', 'joyeria,anillos,collares,pulseras,diamantes'),
('Muebles', 'muebles,decoracion,diseño de interiores,comodidad,estilo'),
('Electrodomésticos', 'electrodomesticos,cocina,lavado,refrigeracion,hogar'),
('Herramientas', 'herramientas,bricolaje,manualidades,reparaciones,construccion'),
('Juguetes', 'juguetes,niños,diversion,aprendizaje,creatividad'),
('Bebés', 'bebes,niños pequeños,cuidado infantil,productos para bebes,maternidad'),
('Libros', 'libros,lectura,novelas,cuentos,conocimiento'),
('Música Clásica', 'musica clasica,orquesta,sinfonia,compositor,instrumentos'),
('Jazz', 'jazz,improvisacion,blues,swing,musica americana'),
('Rock', 'rock,bandas,guitarra,conciertos,musica alternativa'),
('Pop', 'pop,musica popular,canciones,artistas,tendencias'),
('Agricultura', 'agricultura,cultivo,cosecha,granjas,alimentos'),
('Ganadería', 'ganaderia,animales,cría,pastoreo,producción'),
('Pesca', 'pesca,mariscos,océano,barcos,redes'),
('Minería', 'mineria,minerales,extracción,recursos,excavación'),
('Energía', 'energia,renovable,solar,eólica,nuclear'),
('Transporte', 'transporte,logística,envíos,vehículos,rutas'),
('Telecomunicaciones', 'telecomunicaciones,redes,internet,telefonía,comunicación'),
('Biotecnología', 'biotecnologia,genética,medicina,investigación,organismos'),
('Nanotecnología', 'nanotecnologia,materiales,partículas,ingeniería,ciencia'),
('Aeroespacial', 'aeroespacial,aviación,espacio,cohetes,satélites'),
('Defensa', 'defensa,militar,seguridad,armas,estrategia'),
('Justicia', 'justicia,leyes,derecho,tribunales,abogados'),
('Política', 'politica,gobierno,elecciones,partidos,opinión'),
('Religión', 'religion,espiritualidad,creencias,fe,comunidad'),
('Cultura', 'cultura,tradiciones,costumbres,arte,sociedad'),
('Idiomas', 'idiomas,lenguas,traducción,aprendizaje,comunicación'),
('Geografía', 'geografia,mapas,regiones,clima,paisajes'),
('Astronomía', 'astronomia,estrellas,planetas,galaxias,universo'),
('Matemáticas', 'matematicas,números,ecuaciones,cálculo,geometría'),
('Física', 'fisica,energía,materia,fuerzas,leyes'),
('Química', 'quimica,elementos,compuestos,reacciones,laboratorio'),
('Biología', 'biologia,vida,organismos,células,ecosistemas'),
('Medicina', 'medicina,salud,enfermedades,tratamientos,diagnóstico'),
('Farmacia', 'farmacia,medicamentos,drogas,recetas,salud'),
('Odontología', 'odontologia,dientes,encías,salud bucal,tratamientos'),
('Enfermería', 'enfermeria,cuidados,pacientes,hospitales,salud'),
('Fisioterapia', 'fisioterapia,rehabilitación,movimiento,terapia,salud'),
('Nutrición', 'nutricion,alimentos,dietas,salud,bienestar'),
('Psiquiatría', 'psiquiatria,salud mental,trastornos,terapia,emociones'),
('Sociología', 'sociologia,sociedad,comportamiento,grupos,cultura'),
('Antropología', 'antropologia,humanidad,culturas,orígenes,evolución'),
('Arqueología', 'arqueologia,pasado,civilizaciones,excavaciones,artefactos'),
('Lingüística', 'linguistica,lenguaje,gramática,fonética,semántica'),
('Semiótica', 'semiotica,signos,símbolos,interpretación,comunicación'),
('Ética', 'etica,moral,valores,principios,conducta'),
('Derechos Humanos', 'derechos humanos,libertad,igualdad,justicia,dignidad'),
('Paz', 'paz,armonía,cooperación,entendimiento,resolución'),
('Desarrollo Sostenible', 'desarrollo sostenible,ecología,economía,sociedad,futuro'),
('Ayuda Humanitaria', 'ayuda humanitaria,emergencias,desastres,refugiados,asistencia'),
('Voluntariado', 'voluntariado,servicio,comunidad,ayuda,compromiso'),
('Filantropía', 'filantropia,donaciones,caridad,apoyo,causas'),
('Innovación Social', 'innovacion social,soluciones,impacto,comunidad,cambio'),
('Economía Social', 'economia social,cooperativas,empresas sociales,comunidad,desarrollo'),
('Comercio Justo', 'comercio justo,precios justos,productores,consumidores,ética'),
('Consumo Responsable', 'consumo responsable,ética,sostenibilidad,impacto,elecciones'),
('Alimentación Saludable', 'alimentacion saludable,nutrición,bienestar,ingredientes,recetas'),
('Fitness', 'fitness,deporte,ejercicio,fisico,salud,actividad,gym,gymbro'),
('Mindfulness', 'mindfulness,atención plena,meditación,bienestar,conciencia'),
('Yoga', 'yoga,posturas,respiración,meditación,bienestar'),
('Espiritualidad', 'espiritualidad,conexión,propósito,significado,trascendencia');
