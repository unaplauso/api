-- ALTER TABLE "project" ALTER COLUMN "deadline" SET DATA TYPE timestamp(0);
ALTER TABLE "project_file" ADD CONSTRAINT "project_file_fileId_unique" UNIQUE("file_id");
ALTER TABLE "project" ADD CONSTRAINT "goal_gte_quotation_check" CHECK (("project"."goal" is null or "project"."quotation" is null or "project"."goal" >= "project"."quotation"));