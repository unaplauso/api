CREATE EXTENSION pg_trgm;

CREATE TYPE "public"."file_type" AS ENUM('profile_pic', 'profile_banner', 'project_file', 'project_thumbnail');
CREATE TYPE "public"."s3_bucket" AS ENUM('unaplauso-public');
CREATE TYPE "public"."report_creator_reason" AS ENUM('spam', 'fraud', 'tos_disrespect', 'stolen_content', 'misleading_information', 'intellectual_property_violation', 'illegal_activity', 'harassment', 'discrimination', 'inappropriate_content', 'abusive_behavior');
CREATE TYPE "public"."report_project_reason" AS ENUM('spam', 'fraud', 'tos_disrespect', 'stolen_content', 'misleading_information', 'intellectual_property_violation', 'illegal_activity', 'harassment', 'discrimination', 'inappropriate_content', 'abusive_behavior');
CREATE TABLE "creator_donation" (
	"donation_id" integer PRIMARY KEY NOT NULL,
	"creator_id" integer NOT NULL
);

CREATE TABLE "creator_interaction" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"creator_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "donation" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"message" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"quotation" numeric DEFAULT '1' NOT NULL,
	"amount" numeric NOT NULL,
	"value" numeric GENERATED ALWAYS AS ("donation"."amount" * "donation"."quotation") STORED NOT NULL,
	"transaction_data" json
);

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
	"bucket" "s3_bucket" DEFAULT 'unaplauso-public' NOT NULL,
	"type" "file_type" NOT NULL,
	"mimetype" varchar(96),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_nsfw" boolean DEFAULT false NOT NULL
);

CREATE TABLE "project_donation" (
	"donation_id" integer PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL
);

CREATE TABLE "project_file" (
	"file_id" uuid PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL
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
	"title" varchar(64) NOT NULL,
	"creator_id" integer NOT NULL,
	"deadline" timestamp,
	"quotation" numeric DEFAULT '1' NOT NULL,
	"goal" numeric,
	"thumbnail_file_id" uuid,
	"description" varchar(10000),
	"is_canceled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "report_creator" (
	"user_id" integer NOT NULL,
	"creator_id" integer NOT NULL,
	"reason" "report_creator_reason",
	"message" varchar(500),
	CONSTRAINT "report_creator_user_id_creator_id_pk" PRIMARY KEY("user_id","creator_id"),
	CONSTRAINT "reason_or_message_check" CHECK (("report_creator"."reason" is not null or "report_creator"."message" is not null))
);

CREATE TABLE "report_project" (
	"user_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"reason" "report_project_reason",
	"message" varchar(500),
	CONSTRAINT "report_project_user_id_project_id_pk" PRIMARY KEY("user_id","project_id"),
	CONSTRAINT "reason_or_message_check" CHECK (("report_project"."reason" is not null or "report_project"."message" is not null))
);

CREATE TABLE "topic" (
	"id" "smallserial" PRIMARY KEY NOT NULL,
	"name" varchar(32) NOT NULL,
	"aliases" varchar(320) NOT NULL,
	CONSTRAINT "topic_name_unique" UNIQUE("name")
);

CREATE TABLE "user_detail" (
	"id" integer PRIMARY KEY NOT NULL,
	"description" varchar(10000),
	"custom_thanks" varchar(1000),
	"location" varchar(64),
	"quotation" numeric DEFAULT '1' NOT NULL,
	"personal_url" varchar(255),
	"instagram_user" varchar(100),
	"facebook_user" varchar(100),
	"x_user" varchar(50),
	"tiktok_user" varchar(50),
	"github_user" varchar(100),
	CONSTRAINT "personal_url_check" CHECK ("user_detail"."personal_url" IS NULL OR "user_detail"."personal_url" ~ '[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)'),
	CONSTRAINT "instagram_user_check" CHECK ("user_detail"."instagram_user" IS NULL OR "user_detail"."instagram_user" ~ '^@?[a-zA-Z0-9._]{1,30}$'),
	CONSTRAINT "facebook_user_check" CHECK ("user_detail"."facebook_user" IS NULL OR "user_detail"."facebook_user" ~ '^[a-zA-Z0-9.]{5,50}$'),
	CONSTRAINT "x_user_check" CHECK ("user_detail"."x_user" IS NULL OR "user_detail"."x_user" ~ '^@?[a-zA-Z0-9_]{1,15}$'),
	CONSTRAINT "tiktok_user_check" CHECK ("user_detail"."tiktok_user" IS NULL OR "user_detail"."tiktok_user" ~ '^@?[a-zA-Z0-9_.]{1,24}$'),
	CONSTRAINT "github_user_check" CHECK ("user_detail"."github_user" IS NULL OR "user_detail"."github_user" ~ '^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$')
);

CREATE TABLE "user_topic" (
	"user_id" integer NOT NULL,
	"topic_id" integer NOT NULL,
	CONSTRAINT "user_topic_user_id_topic_id_pk" PRIMARY KEY("user_id","topic_id")
);

CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(32),
	"display_name" varchar(64),
	"email" varchar(320) NOT NULL,
	"profile_pic_file_id" uuid,
	"profile_banner_file_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "username_format_check" CHECK ("user"."username" IS NULL OR "user"."username" ~ '^[a-zA-Z0-9_-]{2,32}$')
);

ALTER TABLE "creator_donation" ADD CONSTRAINT "creator_donation_donation_id_donation_id_fk" FOREIGN KEY ("donation_id") REFERENCES "public"."donation"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "creator_donation" ADD CONSTRAINT "creator_donation_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "creator_interaction" ADD CONSTRAINT "creator_interaction_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "donation" ADD CONSTRAINT "donation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "favorite_creator" ADD CONSTRAINT "favorite_creator_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "favorite_creator" ADD CONSTRAINT "favorite_creator_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "favorite_project" ADD CONSTRAINT "favorite_project_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "favorite_project" ADD CONSTRAINT "favorite_project_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "project_donation" ADD CONSTRAINT "project_donation_donation_id_donation_id_fk" FOREIGN KEY ("donation_id") REFERENCES "public"."donation"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "project_donation" ADD CONSTRAINT "project_donation_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "project_file" ADD CONSTRAINT "project_file_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "project_file" ADD CONSTRAINT "project_file_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "project_interaction" ADD CONSTRAINT "project_interaction_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "project_topic" ADD CONSTRAINT "project_topic_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "project_topic" ADD CONSTRAINT "project_topic_topic_id_topic_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topic"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "project" ADD CONSTRAINT "project_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "project" ADD CONSTRAINT "project_thumbnail_file_id_file_id_fk" FOREIGN KEY ("thumbnail_file_id") REFERENCES "public"."file"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "report_creator" ADD CONSTRAINT "report_creator_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "report_creator" ADD CONSTRAINT "report_creator_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "report_project" ADD CONSTRAINT "report_project_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "report_project" ADD CONSTRAINT "report_project_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_detail" ADD CONSTRAINT "user_detail_id_user_id_fk" FOREIGN KEY ("id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_topic" ADD CONSTRAINT "user_topic_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_topic" ADD CONSTRAINT "user_topic_topic_id_topic_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topic"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user" ADD CONSTRAINT "user_profile_pic_file_id_file_id_fk" FOREIGN KEY ("profile_pic_file_id") REFERENCES "public"."file"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "user" ADD CONSTRAINT "user_profile_banner_file_id_file_id_fk" FOREIGN KEY ("profile_banner_file_id") REFERENCES "public"."file"("id") ON DELETE set null ON UPDATE no action;
CREATE INDEX "creator_interaction_project_id_idx" ON "creator_interaction" USING btree ("creator_id");
CREATE INDEX "creator_interaction_created_at_idx" ON "creator_interaction" USING btree ("created_at");
CREATE INDEX "project_interaction_project_id_idx" ON "project_interaction" USING btree ("project_id");
CREATE INDEX "project_interaction_created_at_idx" ON "project_interaction" USING btree ("created_at");
CREATE INDEX "topic_aliases_trgm" ON "topic" USING gin ("aliases" gin_trgm_ops);
CREATE INDEX "topic_name_trgm" ON "topic" USING gin ("name" gin_trgm_ops);
CREATE UNIQUE INDEX "user_username_unique_lower" ON "user" USING btree (lower("username"));
CREATE INDEX "user_username_trgm" ON "user" USING gist ("username" gist_trgm_ops);
CREATE UNIQUE INDEX "user_email_unique_lower" ON "user" USING btree (lower("email"));
CREATE VIEW "public"."project_top" AS (with "project_topic_cte" as (select "project_topic"."project_id", json_agg(json_build_object('id', "topic"."id", 'name', "topic"."name")) as "topics", array_agg("topic"."id") as "topic_ids" from "project_topic" inner join "topic" on "topic"."id" = "project_topic"."topic_id" group by "project_topic"."project_id"), "project_donation_cte" as (select "project_donation"."project_id", sum("donation"."amount") as "amount", sum("donation"."value") as "value" from "project_donation" inner join "donation" on "donation"."id" = "project_donation"."project_id" group by "project_donation"."project_id"), "project_file_cte" as (select "project_file"."project_id", json_agg(json_build_object('id', "file"."id", 'isNsfw', "file"."is_nsfw")) as "files" from "project_file" inner join "file" on "file"."id" = "project_file"."file_id" group by "project_file"."project_id") select "project"."id", "project"."title", "project"."description", "project"."created_at", "project"."deadline", case when "project"."thumbnail_file_id" is not null then json_build_object('id', "project_thumbnail_file"."id", 'bucket', "project_thumbnail_file"."bucket", 'isNsfw', "project_thumbnail_file"."is_nsfw") else null end as "thumbnail", case when "project"."is_canceled" = true then 'canceled' when "amount" >= "project"."goal" then 'completed' when "project"."deadline" <= NOW() then 'failed' else 'open' end as "status", "project"."goal", "project"."quotation", coalesce("amount", 0) as "donations_amount", coalesce("value", 0) as "donations_value", coalesce((select count(*) from "favorite_project" where "favorite_project"."project_id" = "project"."id"), 0) as "favorites", "user"."id" as "creator_id", json_build_object('id', "user"."id", 'username', "user"."username", 'displayName', "user"."display_name", 'profilePic', case when "user"."profile_pic_file_id" is not null then json_build_object('id', "profile_pic_file"."id", 'bucket', "profile_pic_file"."bucket", 'isNsfw', "profile_pic_file"."is_nsfw") else null end) as "creator", coalesce("topics", '[]'::json) as "topics", coalesce("topic_ids", ARRAY[]::smallint[]) as "topic_ids", coalesce("files", '[]'::json) as "files", coalesce((select count(*) from "project_interaction" where "project_interaction"."project_id" = "project"."id"), 0) as "interactions" from "project" left join "file" "project_thumbnail_file" on "project_thumbnail_file"."id" = "project"."thumbnail_file_id" inner join "user" on "user"."id" = "project"."creator_id" left join "file" "profile_pic_file" on "profile_pic_file"."id" = "user"."profile_pic_file_id" left join "project_donation_cte" on "project_donation_cte"."project_id" = "project"."id" left join "project_topic_cte" on "project_topic_cte"."project_id" = "project"."id" left join "project_file_cte" on "project_file_cte"."project_id" = "project"."id");
CREATE MATERIALIZED VIEW "public"."creator_top" AS (select "id" from "user");


-- delete_old_file():
-- Para borrar archivos viejos cuando se updatea su referencia
-- ej: Al updatear user.profile_pic_file_id, necesitamos que se borre el anterior
CREATE OR REPLACE FUNCTION delete_old_file()
RETURNS TRIGGER AS $$ 
DECLARE
  column_name text := TG_ARGV[0];
  old_file_id UUID;
BEGIN
  EXECUTE format('SELECT ($1).%I', column_name)
    USING OLD INTO old_file_id;

  IF old_file_id IS NOT NULL THEN
    DELETE FROM file WHERE id = old_file_id;
  END IF;

  RETURN NEW;
END; 
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profile_pic_file
AFTER UPDATE OF profile_pic_file_id ON "user"
FOR EACH ROW EXECUTE FUNCTION delete_old_file('profile_pic_file_id');

CREATE TRIGGER update_user_profile_banner_file
AFTER UPDATE OF profile_banner_file_id ON "user"
FOR EACH ROW EXECUTE FUNCTION delete_old_file('profile_banner_file_id');

CREATE TRIGGER update_project_thumbnail_file
AFTER UPDATE OF thumbnail_file_id ON "project"
FOR EACH ROW EXECUTE FUNCTION delete_old_file('thumbnail_file_id');

-- notify_file_deleted():
-- Dispara una notificación 'file_deleted' cuando se borra un file
-- Esto se usa para sincronizar el S3; véase apps/file/src/main.ts
CREATE OR REPLACE FUNCTION notify_file_deleted()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('file_deleted', row_to_json(OLD)::TEXT);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER file_deleted AFTER DELETE ON "file"
FOR EACH ROW EXECUTE FUNCTION notify_file_deleted();

-- insert_user_detail():
-- Para auto-crear los details al crear un user
CREATE OR REPLACE FUNCTION insert_user_detail()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_detail ("id") VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_inserted AFTER INSERT ON "user"
FOR EACH ROW EXECUTE FUNCTION insert_user_detail();

/* DATOS FALSOS PARA TESTEAR DE ACÁ PARA ABAJO */

INSERT INTO public.topic ("name", aliases) VALUES
  ('Fútbol', 'futbol|soccer|partido|gol|equipo'),
  ('Asado', 'asado|parrilla|carne|brasa|bbq'),
  ('Tango', 'tango|baile|musica|danza|pareja'),
  ('Mate', 'mate|yerba|infusion|bebida|caliente'),
  ('Empanadas', 'empanadas|relleno|horno|masa|criolla'),
  ('Vino', 'vino|tinto|blanco|copa|uva'),
  ('Cine', 'cine|peliculas|filmes|drama|comedia'),
  ('Literatura', 'literatura|libros|cuentos|poesia|novela'),
  ('Política', 'politica|gobierno|elecciones|estado|poder'),
  ('Economía', 'economia|finanzas|mercados|dinero|inversion'),
  ('Turismo', 'turismo|viajes|destinos|excursiones|vacaciones'),
  ('Moda', 'moda|ropa|estilo|tendencias|diseño'),
  ('Arte', 'arte|pintura|escultura|dibujo|galeria'),
  ('Folklore', 'folklore|tradicion|danza|musica|popular'),
  ('Rock', 'rock|musica|banda|guitarra|concierto'),
  ('Teatro', 'teatro|obra|actores|escenario|drama'),
  ('Danza', 'danza|baile|movimiento|coreografia|ritmo'),
  ('Fotografía', 'fotografia|fotos|imagenes|camara|retrato'),
  ('Diseño', 'diseño|grafico|interiores|creatividad|visual'),
  ('Jardinería', 'jardineria|plantas|flores|jardin|cultivo'),
  ('Mascotas', 'mascotas|perros|gatos|animales|cuidados'),
  ('Cocina', 'cocina|recetas|alimentos|chef|gourmet'),
  ('Deportes', 'deportes|ejercicio|fisico|atletismo|competicion'),
  ('Artes Marciales', 'artesmarciales|defensa|combate|disciplina|dojo'),
  ('Crossfit', 'crossfit|entrenamiento|fuerza|resistencia|wods'),
  ('Yoga', 'yoga|relajacion|cuerpo|mente|equilibrio'),
  ('Meditación', 'meditacion|mente|conciencia|calma| сосредоточение'),
  ('Mindfulness', 'mindfulness|presente|atencion|plena|conciencia'),
  ('Coaching', 'coaching|desarrollo|personal|metas|motivacion'),
  ('Mentoring', 'mentoring|consejos|guia|experiencia|carrera'),
  ('Nutrición', 'nutricion|alimentacion|salud|dieta|vitaminas'),
  ('Fitness', 'fitness|ejercicio|cuerpo|salud|entrenamiento'),
  ('Running', 'running|correr|maraton|entrenamiento|velocidad'),
  ('Ciclismo', 'ciclismo|bicicleta|ruta|montaña|pedalear'),
  ('Senderismo', 'senderismo|montaña|caminata|naturaleza|airelibre'),
  ('Natación', 'natacion|nadar|piscina|estilo|brazada'),
  ('Triatlón', 'triatlon|nadar|ciclismo|correr|resistencia'),
  ('Surf', 'surf|olas|tabla|playa|deporte'),
  ('Skateboarding', 'skateboarding|skate|trucos|calle|rampa'),
  ('Snowboarding', 'snowboarding|nieve|tabla|montaña|invierno'),
  ('Escalada', 'escalada|roca|montaña|cuerda|altura'),
  ('Paracaidismo', 'paracaidismo|salto|aire|adrenalina|vuelo'),
  ('Bungee Jumping', 'bungeejumping|salto|cuerda|altura|emocion'),
  ('Rafting', 'rafting|rio|balsa|aventura|equipo'),
  ('Kayak', 'kayak|rio|lago|mar|remo'),
  ('Turismo Aventura', 'aventura|turismo|extremo|actividades|outdoor'),
  ('Gastronomía', 'gastronomia|comida|platos|sabores|ingredientes'),
  ('Enoturismo', 'enoturismo|vino|bodegas|catas|viñedos'),
  ('Cerveza Artesanal', 'cerveza|artesanal|lupulo|malta|birra'),
  ('Mixología', 'mixologia|cocteles|bebidas|tragos|bar'),
  ('Catas', 'catas|degustacion|sabores|aromas|experiencia'),
  ('Apicultura', 'apicultura|abejas|miel|colmena|polen'),
  ('Huertos', 'huertos|verduras|plantas|organico|cultivo'),
  ('Comida Vegana', 'vegana|plantas|saludable|recetas|sincarne'),
  ('Alimentos Orgánicos', 'organicos|naturales|salud|ecologico|sintoxicos'),
  ('Cero Residuos', 'ceroresiduos|reciclaje|reutilizar|sintoxicos|ecologico'),
  ('Movilidad Eléctrica', 'electrica|coche|bici|transporte|sostenible'),
  ('Turismo Rural', 'rural|campo|naturaleza|tradicion|pueblos'),
  ('Comercio Justo', 'justo|etica|productos|trabajo|salarios'),
  ('Economía Circular', 'circular|reutilizar|reparar|reciclar|sostenible'),
  ('Desarrollo Social', 'social|comunidad|ayuda|proyectos|igualdad'),
  ('Energías', 'energias|solar|eolica|renovables|sostenible'),
  ('Bioconstrucción', 'bioconstruccion|tierra|madera|natural|ecologico'),
  ('Permacultura', 'permacultura|diseño|sostenible|alimentos|tierra'),
  ('Comunidades', 'comunidades|ecologicas|alternativa|vida|cooperativa'),
  ('Minimalismo', 'minimalismo|menos|simple|objetos|vida'),
  ('Mindful Eating', 'mindfuleating|comer|consciente|sabores|salud'),
  ('Desarrollo Humano', 'desarrollohumano|personal|potencial|crecimiento|ser'),
  ('Psicología', 'psicologia|mente|emociones|conducta|terapia'),
  ('Comunicación', 'comunicacion|dialogo|palabras|expresar|entender'),
  ('Liderazgo', 'liderazgo|equipo|vision|guiar|motivar'),
  ('Gestión Tiempo', 'gestiontiempo|productividad|organizar|planificar|eficiencia'),
  ('Oratoria', 'oratoria|hablar|publico|discursos|elocuencia'),
  ('Naturaleza', 'naturaleza|paisajes|animales|silvestre|airelibre'),
  ('Modelaje', 'modelaje|moda|pasarela|fotografia|estilo|onlyfans|cafecito'),
  ('Actuación', 'actuacion|teatro|cine|personajes|interpretar'),
  ('Clásica', 'clasica|ballet|musica|danza|elegancia'),
  ('Música', 'musica|sonido|instrumentos|melodia|ritmo'),
  ('Audiovisual', 'audiovisual|video|cine|television|produccion'),
  ('Videojuegos', 'videojuegos|juegos|gaming|consolas|pc'),
  ('Contenido Digital', 'contenidodigital|online|redessociales|creatividad|viral'),
  ('Animación', 'animacion|dibujos|3d|2d|motiongraphics'),
  ('Esports', 'esports|torneos|competicion|gamers|profesional'),
  ('Streaming', 'streaming|online|directo|video|plataformas'),
  ('Podcast', 'podcast|audio|programas|entrevistas|temas'),
  ('Blog', 'blog|articulos|escritos|online|web'),
  ('Marketing Afiliación', 'afiliacion|productos|ventas|comisiones|online'),
  ('Comunidad', 'comunidad|online|social|miembros|engagement'),
  ('Publicidad', 'publicidad|anuncios|campañas|online|segmentacion'),
  ('Analítica', 'analitica|datos|informacion|web|estadisticas'),
  ('Aplicaciones', 'aplicaciones|moviles|android|ios|apps'),
  ('Diseño Web', 'diseñoweb|web|paginas|interfaz|ux'),
  ('Fotografía Aérea', 'aerea|drones|paisajes|vistas|imagenes'),
  ('Ilustración', 'ilustracion|dibujo|arte|digital|creatividad'),
  ('Escritura Creativa', 'escritura|creativa|cuentos|poemas|relatos'),
  ('Idiomas', 'idiomas|ingles|español|frances|aprender'),
  ('Historia del Arte', 'historia|arte|pintura|escultura|movimientos'),
  ('Religión', 'religion|creencias|espiritualidad|fe|dios'),
  ('Mitología', 'mitologia|leyendas|dioses|heroes|cuentos'),
  ('Cine Independiente', 'independiente|peliculas|arte|alternativo|culto'),
  ('Documentales', 'documentales|realidad|historias|investigacion|sociedad'),
  ('Viajes Culturales', 'culturales|historia|tradiciones|arte|ciudades'),
  ('Voluntariado', 'voluntariado|ayuda|comunidad|ong|servicio'),
  ('Donaciones', 'donaciones|caridad|aportes|ayuda|fondos'),
  ('Criptomonedas', 'criptomonedas|bitcoin|ethereum|blockchain|trading'),
  ('Inversiones', 'inversiones|acciones|bonos|fondos|rentabilidad'),
  ('Ahorro', 'ahorro|finanzas|presupuesto|personales|dinero'),
  ('Crowdfunding', 'crowdfunding|financiamiento|colectivo|proyectos|ideas'),
  ('Comida Rápida', 'comidarapida|hamburguesas|papasfritas|pizza|sabor'),
  ('Comida Casera', 'comidacasera|hechoencasa|familiar|recetas|tradicion'),
  ('Repostería', 'reposteria|dulces|tortas|pasteles|postres'),
  ('Panadería', 'panaderia|pan|masas|horno|harina'),
  ('Café', 'cafe|granos|aromas|sabores|bebida'),
  ('Té', 'te|infusiones|hierbas|aromas|sabores'),
  ('Cerveza', 'cerveza|rubia|negra|artesanal|importada'),
  ('Vino Tinto', 'vintotinto|malbec|cabernet|uva|barrica'),
  ('Vino Blanco', 'vinoblanco|chardonnay|sauvignon|uva|fresco'),
  ('Cócteles', 'cocteles|tragos|bebidas|alcohol|bar'),
  ('Malabares', 'malabares|habilidad|circo|bolas|mazas'),
  ('Magia', 'magia|ilusionismo|trucos|espectaculo|misterio'),
  ('Astronomía', 'astronomia|estrellas|planetas|galaxias|universo'),
  ('Biología', 'biologia|vida|animales|plantas|ecosistemas'),
  ('Geología', 'geologia|tierra|rocas|minerales|terremotos'),
  ('Química', 'quimica|elementos|moleculas|reacciones|laboratorio'),
  ('Física', 'fisica|energia|materia|particulas|relatividad'),
  ('Matemáticas', 'matematicas|numeros|ecuaciones|calculo|geometria'),
  ('Programación', 'programacion|codigo|software|desarrollo|web'),
  ('Robótica', 'robotica|robots|automatizacion|ingenieria|tecnologia'),
  ('Inteligencia Artificial', 'ia|ai|machinelearning|redesneuronales|algoritmos'),
  ('Realidad Virtual', 'realidadvirtual|rv|vr|inmersion|simulacion'),
  ('Realidad Aumentada', 'realidadaumentada|ra|ar|interaccion|aplicaciones'),
  ('Internet', 'internet|red|online|conexion|navegar'),
  ('Redes Sociales', 'redessociales|facebook|instagram|twitter|comunidad'),
  ('Música Clásica', 'musicaclasica|orquesta|sinfonia|concierto|opera'),
  ('Jazz', 'jazz|improvisacion|ritmo|blues|swing'),
  ('Blues', 'blues|tristeza|guitarra|armonica|feeling'),
  ('Rock and Roll', 'rockandroll|años50|guitarra|baile|rebeldia'),
  ('Pop', 'pop|canciones|exito|radio|tendencia'),
  ('Hip Hop', 'hiphop|rap|rimas|beats|cultura'),
  ('Electrónica', 'electronica|dj|sintetizador|baile|fiesta'),
  ('Country', 'country|guitarra|america|vaqueros|pradera'),
  ('Reggae', 'reggae|jamaica|rastafari|paz|amor'),
  ('Salsa', 'salsa|ritmo|baile|latino|tropical'),
  ('Tango Argentino', 'argentinotango|gardel|piazzolla|bandoneon|milonga'),
  ('Flamenco', 'flamenco|españa|baile|cante|guitarra'),
  ('Ópera', 'opera|canto|lirico|drama|escenario'),
  ('Ballet', 'ballet|danza|clasica|elegancia|gracia'),
  ('Boxeo', 'boxeo|deporte|lucha|guantes|ring'),
  ('Fútbol Americano', 'futbolamericano|touchdown|equipo|estadio|tackle'),
  ('Balonmano', 'balonmano|equipo|gol|balon|cancha'),
  ('Voleibol', 'voleibol|red|equipo|remate|bloqueo'),
  ('Hockey', 'hockey|hielo|palo|disco|porteria'),
  ('Tenis', 'tenis|raqueta|pelota|cancha|saque'),
  ('Atletismo', 'atletismo|carrera|salto|lanzamiento|medalla'),
  ('Gimnasia', 'gimnasia|flexibilidad|fuerza|equilibrio|ejercicios'),
  ('Esgrima', 'esgrima|espada|florete|sable|combate'),
  ('Equitación', 'equitacion|caballos|jinete|salto|campo'),
  ('Turismo Ecológico', 'ecologico|naturaleza|conservacion|sostenible|ambiental'),
  ('Refugios Animales', 'refugiosanimales|rescate|adopcion|mascotas|cuidado'),
  ('Orfanatos', 'orfanatos|niños|ayuda|cuidado|hogar'),
  ('Discapacidad', 'discapacidad|inclusion|accesibilidad|derechos|apoyo'),
  ('Adultos Mayores', 'adultosmayores|terceraedad|cuidado|salud|bienestar'),
  ('Pueblos Originarios', 'pueblosoriginarios|indigenas|cultura|tradicion|comunidad'),
  ('Investigación', 'investigacion|ciencia|estudio|descubrimientos|conocimiento'),
  ('Espacio', 'espacio|universo|estrellas|planetas|exploracion'),
  ('Nanotecnología', 'nanotecnologia|nano|ciencia|materiales|medicina'),
  ('Biotecnología', 'biotecnologia|organismos|genetica|medicina|alimentos'),
  ('Neurociencia', 'neurociencia|cerebro|mente|neuronas|conducta'),
  ('Clima', 'clima|tiempo|temperatura|lluvia|sol'),
  ('Sustentabilidad', 'sustentabilidad|ecologia|renovable|conservacion|futuro'),
  ('Filantropía', 'filantropia|donaciones|caridad|ayuda|humanitarismo'),
  ('Activismo', 'activismo|causas|derechos|social|protesta'),
  ('Diseño Gráfico', 'disenografico|ilustracion|logotipos|branding|marketing'),
  ('Diseño Industrial', 'disenoindustrial|productos|ergonomia|innovacion|prototipos'),
  ('Desarrollo Web', 'desarrolloweb|frontend|backend|fullstack|codigo'),
  ('Desarrollo Móvil', 'desarrollomovil|android|ios|apps|programacion'),
  ('Base de Datos', 'basededatos|sql|nosql|almacenamiento|datos'),
  ('Ciberseguridad', 'ciberseguridad|seguridadinformatica|hacking|virus|proteccion'),
  ('Cloud Computing', 'cloudcomputing|nube|servicios|almacenamiento|aws'),
  ('eCommerce', 'ecommerce|tiendaonline|ventas|productos|comercio'),
  ('Logística', 'logistica|envios|almacenamiento|distribucion|transporte'),
  ('Impuestos', 'impuestos|declaracion|tasas|fiscal|contabilidad'),
  ('Jubilación', 'jubilacion|pensiones|ahorro|retiro|futuro'),
  ('Blockchain', 'blockchain|cripto|descentralizacion|tecnologia|seguridad'),
  ('NFTs', 'nfts|arte|coleccionables|token|digital'),
  ('Metaverso', 'metaverso|virtual|inmersion|avatares|mundo'),
  ('EdTech', 'edtech|educacion|tecnologia|aprendizaje|online'),
  ('FinTech', 'fintech|finanzas|tecnologia|pagos|bancos'),
  ('Salud Mental', 'saludmental|bienestar|emociones|terapia|apoyo'),
  ('Derechos Humanos', 'derechoshumanos|igualdad|libertad|justicia|dignidad'),
  ('Medicina', 'medicina|salud|doctores|enfermedades|tratamientos'),
  ('Odontología', 'odontologia|dientes|dentista|sonrisa|saludbucal'),
  ('Psiquiatría', 'psiquiatria|saludmental|trastornos|terapia|medicacion'),
  ('Cirugía', 'cirugia|operacion|medicos|hospital|anestesia'),
  ('Veterinaria', 'veterinaria|animales|mascotas|salud|cuidado'),
  ('Ayuda Social', 'ayudasocial|comunidad|necesidades|apoyo|programas'),
  ('Inmigrantes', 'inmigrantes|refugiados|ayuda|integracion|derechos'),
  ('Género', 'genero|igualdad|feminismo|diversidad|lgtbiq'),
  ('Derecho', 'derecho|leyes|justicia|abogados|normas'),
  ('Periodismo', 'periodismo|noticias|informacion|investigacion|comunicacion'),
  ('Fotoperiodismo', 'fotoperiodismo|noticias|imagenes|documental|eventos'),
  ('Robótica Educativa', 'roboticaeducativa|niños|programacion|ciencia|juguetes'),
  ('Modelismo Naval', 'modelismonaval|barcos|miniaturas|historia|maquetas'),
  ('Astronomía Aficionada', 'astronomiaaficionada|telescopios|estrellas|planetas|observacion'),
  ('Filatelia Temática', 'filateliatematica|sellos|coleccion|temas|historia'),
  ('Numismática Antigua', 'numismaticaantigua|monedas|coleccion|historia|valor'),
  ('Radioafición Digital', 'radioaficiondigital|comunicacion|ondas|electronica|tecnologia'),
  ('Reparación Electrónica', 'reparacionelectronica|arreglos|componentes|circuitos|tecnologia'),
  ('Restauración Autos Clásicos', 'restauracionautosclasicos|coches|antiguos|motor|chapa'),
  ('Carpintería Creativa', 'carpinteriacreativa|madera|diseño|muebles|herramientas'),
  ('Cerámica Artística', 'ceramicaartistica|arcilla|escultura|pintura|horno'),
  ('Tejido Artesanal', 'tejidoartesanal|lana|crochet|dosagujas|hilos'),
  ('Costura a Medida', 'costuraamedida|diseño|patrones|ropa|confeccion'),
  ('Patchwork Moderno', 'patchworkmoderno|telas|colores|diseño|texturas'),
  ('Origami Modular', 'origamimodular|papel|plegado|figuras|geometricas'),
  ('Caligrafía Inglesa', 'caligrafiainglesa|letras|pluma|tinta|elegancia'),
  ('Juegos de Mesa', 'juegosdemesa|estrategia|familia|amigos|diversion'),
  ('Ilusionismo de Cerca', 'ilusionismodecerca|magia|cartas|monedas|habilidad'),
  ('Cocina Asiática', 'cocinaasiatica|china|japonesa|tailandesa|sabores'),
  ('Cocina Italiana', 'cocinaitaliana|pasta|pizza|salsas|quesos'),
  ('Cocina Mexicana', 'cocinamexicana|tacos|burritos|picante|sabores'),
  ('Panadería Casera', 'panaderiacasera|pan|masas|horno|aromas'),
  ('Repostería Vegana', 'reposteriavegana|dulces|pasteles|ingredientesvegetales|sincarne'),
  ('Cata de Vinos del Mundo', 'catadevinosdelmundo|paises|cepas|aromas|sabores'),
  ('Elaboración Cerveza Casera', 'elaboracioncervezacasera|malta|lupulo|ingredientes|fermentacion'),
  ('Mixología Tiki', 'mixologiatiki|cocteles|frutas|ron|paraiso'),
  ('Cafetería de Especialidad', 'cafeteriadeespecialidad|granosselectos|latteart|aromas|sabores'),
  ('Agricultura Ecológica', 'agriculturaecologica|huertos|sintoxicos|naturales|abonosorganicos'),
  ('Jardines Verticales', 'jardinesverticales|plantas|muros|espaciosreducidos|decoracion'),
  ('Comida Macrobiótica', 'comidamacrobiotica|equilibrio|yin|yang|salud'),
  ('Cosmética Natural', 'cosmeticanatural|ingredientesnaturales|piel|cabello|sintoxicos'),
  ('Ciclismo Urbano', 'ciclismourbano|bicicletas|movilidad|ciudad|sostenible'),
  ('Senderismo Interpretativo', 'senderismointerpretativo|naturaleza|fauna|flora|conocimiento'),
  ('Turismo Responsable', 'turismoresponsable|comunidades|impactoambiental|etica|viajes'),
  ('Comercio Local', 'comerciolocal|productosartesanales|emprendedores|comunidad|apoyo'),
  ('Finanzas Éticas', 'finanzaseticas|inversionesresponsables|bancosocial|impactopositivo|dinero'),
  ('Hogar Sustentable', 'hogarsustentable|ecologico|ahorroenergia|recursos|limpieza'),
  ('Comunidades Intencionales', 'comunidadesintencionales|convivencia|cooperacion|alternativa|valores'),
  ('Alimentación Consciente', 'alimentacionconsciente|plenaatencion|sabores|emociones|cuerpo'),
  ('Crianza Respetuosa', 'crianzarespetuosa|apego|emociones|limites|dialogo'),
  ('Educación Alternativa', 'educacionalternativa|montessori|waldorf|homeschooling|pedagogiasactivas'),
  ('Desarrollo Transpersonal', 'desarrollotranspersonal|autoconocimiento|espiritualidad|ser|potencial'),
  ('Comunicación Asertiva', 'comunicacionasertiva|expresion|respeto|necesidades|dialogo'),
  ('Gestión Proyectos', 'gestionproyectos|planificacion|organizacion|recursos|resultados'),
  ('Marca Personal', 'marcapersonal|identidad|valores|diferenciacion|online'),
  ('Fotografía Nocturna', 'fotografianocturna|estrellas|paisajes|largaexposicion|luces'),
  ('Estilismo', 'estilismo|moda|imagen|tendencias|personalidad'),
  ('Doblaje', 'doblaje|voces|personajes|interpretacion|audiovisual'),
  ('Guionismo', 'guionismo|historias|personajes|dialogos|cine'),
  ('Dirección Artística', 'direccionartistica|cine|teatro|escenografia|vestuario'),
  ('Sonido', 'sonido|musica|efectos|mezcla|grabacion'),
  ('Animación Stop Motion', 'animacionstopmotion|plastilina|objetos|cuadroacuadro|creatividad'),
  ('Diseño Juegos', 'diseñojuegos|videojuegos|mecanicas|narrativa|experiencia'),
  ('Producción Audiovisual', 'produccionaudiovisual|cine|television|publicidad|video'),
  ('Estrategia Contenido', 'estrategiacontenido|redessociales|blog|engagement|audiencia'),
  ('Diseño UX/UI', 'diseñouxui|experienciausuario|interfaz|usabilidad|navegacion'),
  ('Desarrollo Front-End', 'desarrollofrontend|html|css|javascript|web'),
  ('Desarrollo Back-End', 'desarrollobackend|servidores|basededatos|lenguajes|web'),
  ('Big Data Analytics', 'bigdataanalytics|datosmasivos|tendencias|informes|estrategias'),
  ('Marketing Influencers', 'marketinginfluencers|redessociales|colaboraciones|audiencia|engagement'),
  ('SEO Técnico', 'seotecnico|optimizacionweb|velocidad|indexacion|posicionamiento'),
  ('Analítica Digital', 'analiticadigital|metricas|kpis|informes|decisiones'),
  ('Desarrollo Apps Híbridas', 'desarrolloappshibridas|reactnative|ionic|multiplataforma|movil'),
  ('Arte Abstracto', 'arteabstracto|colores|formas|expresion|creatividad'),
  ('Escultura Contemporánea', 'esculturacontemporanea|materiales|tecnicas|conceptos|espacio'),
  ('Poesía Visual', 'poesiavisual|imagenes|palabras|sensaciones|arte'),
  ('Historia Mundial', 'historiamundial|civilizaciones|eventos|guerras|culturas'),
  ('Sociología', 'sociologia|sociedad|comportamiento|estructuras|grupos'),
  ('Antropología', 'antropologia|culturas|origenes|humanidad|diversidad'),
  ('Ciencia Política', 'cienciapolitica|sistemas|partidos|ideologias|estado'),
  ('Relaciones Internacionales', 'relacionesinternacionales|diplomacia|paises|organizaciones|globalizacion'),
  ('Teología', 'teologia|dios|fe|religiones|espiritualidad'),
  ('Misticismo', 'misticismo|experiencia|iluminacion|union|conciencia'),
  ('Ética', 'etica|moral|valores|principios|conducta'),
  ('Cine de Autor', 'cinemauteur|directores|estilos|visiones|arte'),
  ('Cine Experimental', 'cineexperimental|tecnicas|narrativas|sensaciones|vanguardia'),
  ('Viajes Solidarios', 'viajessolidarios|comunidades|proyectos|impactopositivo|culturas'),
  ('Acción Social', 'accionsocial|voluntariado|proyectos|comunidad|transformacion'),
  ('Defensa Animal', 'defensaanimal|derechos|proteccion|conciencia|adopcion'),
  ('Apoyo Discapacitados', 'apoyodiscapacitados|inclusion|accesibilidad|recursos|calidaddevida'),
  ('Cuidado Ancianos', 'cuidadoancianos|domicilio|residencias|calidaddevida|salud'),
  ('Derechos Indígenas', 'derechosindigenas|territorio|cultura|autonomia|justicia'),
  ('Astrofísica', 'astrofisica|estrellas|galaxias|universo|fisica'),
  ('Genética', 'genetica|adn|herencia|evolucion|organismos'),
  ('Paleontología', 'paleontologia|fosiles|dinosaurios|evolucion|historia'),
  ('Oceanografía', 'oceanografia|mares|oceanos|vida|clima'),
  ('Meteorología', 'meteorologia|tiempo|clima|prediccion|atmosfera'),
  ('Economía Verde', 'economiaverde|sostenibilidad|recursos|eficiencia|ecologico'),
  ('Derecho Ambiental', 'derechoambiental|leyes|proteccion|recursos|sanciones'),
  ('Humanitarismo', 'humanitarismo|ayuda|desastres|refugiados|emergencias'),
  ('Pacifismo', 'pacifismo|no violencia|resolucionconflictos|paz|dialogo'),
  ('Diseño Web Móvil', 'diseñowebmovil|adaptable|responsive|experienciausuario|moviles'),
  ('Diseño UI', 'diseñoui|interfaz|botones|iconos|usabilidad'),
  ('Desarrollo Full Stack', 'desarrollofullstack|frontend|backend|basededatos|web'),
  ('Testing Software', 'testingsoftware|calidad|pruebas|errores|seguridad'),
  ('DevOps', 'devops|automatizacion|infraestructura|despliegue|operaciones'),
  ('Data Science', 'datascience|datos|analisis|prediccion|machinelearning'),
  ('Marketing Contenidos', 'marketingcontenidos|blog|redessociales|engagement|valor'),
  ('Email Marketing', 'emailmarketing|newsletter|campañas|segmentacion|clientes'),
  ('Social Media', 'socialmedia|redessociales|comunidad|interaccion|engagement'),
  ('Analítica Web', 'analiticaweb|trafico|comportamiento|conversion|optimizacion'),
  ('Comercio Electrónico', 'comercioelectronico|tiendaonline|ventas|productos|pago'),
  ('Finanzas Personales', 'finanzaspersonales|presupuesto|ahorro|inversion|deudas'),
  ('Planificación Familiar', 'planificacionfamiliar|anticonceptivos|saludreproductiva|embarazo|paternidad'),
  ('Salud Infantil', 'saludinfantil|niños|pediatria|vacunas|desarrollo'),
  ('Geriatría', 'geriatria|ancianos|salud|cuidados|calidaddevida'),
  ('Salud Mental Infantil', 'saludmentalinantil|emociones|conducta|terapia|juegos'),
  ('Cuidado Paliativo', 'cuidado paliativo|enfermos terminales|dolor|confort|dignidad'),
  ('Rehabilitación', 'rehabilitacion|fisica|ocupacional|lenguaje|terapia'),
  ('Apoyo Migrantes', 'apoyomigrantes|integracion|idioma|vivienda|empleo'),
  ('Derechos Humanos LGBTIQ', 'derechoshumanoslgtbiq|igualdad|no discriminacion|visibilidad|respeto'),
  ('Derecho Laboral', 'derecholaboral|trabajo|contratos|despidos|salarios'),
  ('Ingeniería Civil', 'ingenieriacivil|infraestructuras|carreteras|puentes|edificios'),
  ('Ingeniería Eléctrica', 'ingenieriaelectrica|energia|electronica|circuitos|potencia'),
  ('Ingeniería Mecánica', 'ingenieria mecanica|maquinas|motores|automatizacion|procesos'),
  ('Radio', 'radio|programas|locutores|entrevistas|musica'),
  ('Guionismo Radiofónico', 'guionismoradiofonico|historias|dialogos|personajes|sonido'),
  ('Locución', 'locucion|voz|radio|television|publicidad'),
  ('Edición Vídeo', 'edicionvideo|premiere|finalcut|adobe|davinci'),
  ('Composición Musical', 'composicionmusical|melodia|armonia|instrumentacion|letras'),
  ('Producción Teatral', 'produccionteatral|escenarios|luces|sonido|actores'),
  ('Dirección Cinematográfica', 'direccioncinematografica|camaras|planos|actores|narrativa'),
  ('Arte Digital', 'artedigital|nft|cryptoarte|diseñografico|ilustracion'),
  ('Música Indie', 'musicaindie|alternativa|emergente|cantautor|bandas'),
  ('Podcast de Humor', 'podcastdehumor|comedias|monologos|sketches|risas'),
  ('Blog de Viajes', 'blogdeviajes|aventura|destinos|cultura|tips'),
  ('Comida Vegana Creativa', 'comidaveganacreativa|gourmet|recetas|innovacion|plantbased'),
  ('Fitness en Casa', 'fitnessencasa|rutinas|ejercicios|online|motivacion'),
  ('Yoga Online', 'yogaonline|clasesenvivo|meditacion|bienestar|relajacion'),
  ('Mindfulness Diario', 'mindfulnessdiario|atencionplena|calma|conciencia|presente'),
  ('Coaching Personalizado', 'coachingpersonalizado|metas|transformacion|mentoring|potencial'),
  ('Mentoring Online', 'mentoringonline|expertos|consejos|guias|experiencia'),
  ('Nutrición Consciente', 'nutricionconsciente|salud|alimentos|equilibrio|bienestar'),
  ('Running al Aire Libre', 'runningalairelibre|parques|senderos|motivacion|comunidad'),
  ('Ciclismo de Montaña', 'ciclismodemontaña|aventura|adrenalina|paisajes|bicicleta'),
  ('Senderismo Extremo', 'senderismoextremo|desafios|montañas|supervivencia|naturaleza'),
  ('Natación en el Mar', 'natacionenelmar|aguasabiertas|playas|desafio|entrenamiento'),
  ('Triatlón Sprint', 'triatlonsprint|rapido|desafio|resistencia|deporte'),
  ('Surf Profesional', 'surfprofesional|competicion|olas|campeonato|habilidad'),
  ('Skateboarding Urbano', 'skateboardingurbano|trucos|streetstyle|cultura|comunidad'),
  ('Snowboarding Freestyle', 'snowboardingfreestyle|trucos|snowpark|competicion|adrenalina'),
  ('Escalada Deportiva', 'escaladadeportiva|competicion|dificultad|cuerdas|muros'),
  ('Paracaidismo Acrobático', 'paracaidismoacrobatico|freestyle|formaciones|vuelo|adrenalina'),
  ('Bungee Jumping Extremo', 'bungeejumpingextremo|alturas|adrenalina|emocion|desafio');

INSERT INTO public."user" (display_name, username, email) VALUES
  ('Luka Cerrutti', 'lukac', 'lukacerrutti2002@gmail.com'),
  ('Jane Doe', 'jane_doe', 'jane.doe@example.com'),
  ('John Smith', 'john_smith', 'john.smith@example.com');

INSERT INTO public.project (title, creator_id, "description") VALUES
  ('Awesome Project 1', 1, 'A really awesome project.'),
  ('Amazing Project 2', 2, 'An absolutely amazing project.');

INSERT INTO public.favorite_project (user_id, project_id) VALUES
	(1, 1),
	(2, 1),
	(3, 2);

INSERT INTO public.favorite_creator (user_id, creator_id) VALUES
	(1, 2),
	(2, 3);

INSERT INTO public.user_topic (user_id, topic_id) VALUES
	(1, 4),
	(1, 5),
	(2, 6);

INSERT INTO public.project_topic (project_id, topic_id) VALUES
	(1, 1),
	(1, 2),
	(2, 3);
