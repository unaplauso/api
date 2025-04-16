
/*
ESTE ARCHIVO EXISTE PARA LLEVAR TRAZABILIDAD
DE LAS FUNCIONES Y TRIGGERS, YA QUE DRIZZLE
NO TIENE UNA FORMA MÁS AMIGABLE DE HACERLO AÚN :(
*/

-- EXTENSIONES
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- creator_top_mv | Indexes
CREATE UNIQUE INDEX creator_top_mv_id_idx ON creator_top_mv (id);
CREATE INDEX creator_top_mv_topic_ids_idx ON creator_top_mv USING GIN (topic_ids);
CREATE INDEX creator_top_mv_donations_value_idx ON creator_top_mv (donations_value DESC);
CREATE INDEX creator_top_mv_last_day_donations_value_idx ON creator_top_mv (last_day_donations_value DESC);
CREATE INDEX creator_top_mv_interactions_idx ON creator_top_mv (interactions DESC);
CREATE INDEX creator_top_user_search_trgm_idx ON public.creator_top_mv
  USING gin (lower(username || '|' || coalesce(display_name, '')) gin_trgm_ops);
REFRESH MATERIALIZED VIEW CONCURRENTLY creator_top_mv;

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

CREATE OR REPLACE TRIGGER update_user_profile_pic_file
AFTER UPDATE OF profile_pic_file_id ON "user"
FOR EACH ROW EXECUTE FUNCTION delete_old_file('profile_pic_file_id');

CREATE OR REPLACE TRIGGER update_user_profile_banner_file
AFTER UPDATE OF profile_banner_file_id ON "user"
FOR EACH ROW EXECUTE FUNCTION delete_old_file('profile_banner_file_id');

CREATE OR REPLACE TRIGGER update_project_thumbnail_file
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

CREATE OR REPLACE TRIGGER file_deleted AFTER DELETE ON "file"
FOR EACH ROW EXECUTE FUNCTION notify_file_deleted();

-- new_user_inserted():
-- Para auto-crear relaciones one-to-one al crear un user
CREATE OR REPLACE FUNCTION new_user_inserted()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_detail ("id") VALUES (NEW.id);
  INSERT INTO user_integration ("id") VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER user_inserted AFTER INSERT ON "user"
FOR EACH ROW EXECUTE FUNCTION new_user_inserted();

-- check_occurrence_limit():
-- Evita que un valor tenga más de x ocurrencias de forma dinámica
-- ej check_occurrence_limit('project_file', 'project_id', 5)
--  + evita que project_file.project_id tenga el mismo valor más de 5 veces
-- Se tendría que cambiar a statement-level y recrear los triggers
CREATE OR REPLACE FUNCTION check_occurrence_limit()
RETURNS trigger AS $$
DECLARE
    ref_value text;
    max_count int := TG_ARGV[2]::int;
    current_count int;
BEGIN
    SELECT row_to_json(NEW)->>TG_ARGV[1] INTO ref_value;

    EXECUTE format(
        'SELECT COUNT(%I) FROM %I WHERE %I::text = $1',
        TG_ARGV[1], TG_ARGV[0], TG_ARGV[1]
    ) INTO current_count USING ref_value;

    IF current_count >= max_count THEN
        RAISE EXCEPTION '%', TG_ARGV[0] || '_limit_exception';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER check_project_file_occurrence_limit
BEFORE INSERT ON project_file FOR EACH ROW
EXECUTE FUNCTION check_occurrence_limit('project_file', 'project_id', 5);

CREATE OR REPLACE TRIGGER check_project_topic_occurrence_limit
BEFORE INSERT ON project_topic FOR EACH ROW
EXECUTE FUNCTION check_occurrence_limit('project_topic', 'project_id', 10);

CREATE OR REPLACE TRIGGER check_user_topic_occurrence_limit
BEFORE INSERT ON user_topic FOR EACH ROW
EXECUTE FUNCTION check_occurrence_limit('user_topic', 'user_id', 10);

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
