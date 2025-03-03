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
	"id" serial PRIMARY KEY NOT NULL,
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
	CONSTRAINT "reason_or_message" CHECK ("report_creator"."reason" IS NOT NULL OR "report_creator"."message" IS NOT NULL)
);

CREATE TABLE "report_project" (
	"user_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"reason" "report_project_reason",
	"message" varchar(500),
	CONSTRAINT "report_project_user_id_project_id_pk" PRIMARY KEY("user_id","project_id"),
	CONSTRAINT "reason_or_message" CHECK ("report_project"."reason" IS NOT NULL OR "report_project"."message" IS NOT NULL)
);

CREATE TABLE "topic" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(32) NOT NULL,
	CONSTRAINT "topic_name_unique" UNIQUE("name")
);

CREATE TABLE "user_interaction" (
	"id" serial PRIMARY KEY NOT NULL,
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
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
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