CREATE TYPE "public"."user_role" AS ENUM('STUDENT', 'MANAGER');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'STUDENT' NOT NULL;