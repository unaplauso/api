CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(64) NOT NULL,
	"email" varchar(320) NOT NULL,
	"password" varchar NOT NULL,
	"name" varchar(128),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
