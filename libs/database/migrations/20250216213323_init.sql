CREATE TYPE "public"."file_type" AS ENUM('profile_pic', 'profile_banner');
CREATE TYPE "public"."report_reason" AS ENUM('spam', 'fraud', 'tos_disrespect', 'stolen_content');
CREATE TABLE "file" (
	"key" varchar(64) PRIMARY KEY NOT NULL,
	"type" "file_type" NOT NULL,
	"mimetype" varchar(96)
);

CREATE TABLE "report" (
	"user_id" integer NOT NULL,
	"reported_id" integer NOT NULL,
	"reason" "report_reason",
	"message" varchar(500),
	CONSTRAINT "report_user_id_reported_id_pk" PRIMARY KEY("user_id","reported_id"),
	CONSTRAINT "reason_or_message" CHECK ("report"."reason" IS NOT NULL OR "report"."message" IS NOT NULL)
);

CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(64),
	"email" varchar(320) NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);

ALTER TABLE "report" ADD CONSTRAINT "report_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "report" ADD CONSTRAINT "report_reported_id_user_id_fk" FOREIGN KEY ("reported_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;