ALTER TABLE "students" ADD COLUMN "auth_user_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'SISWA' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "students_auth_user_id_idx" ON "students" USING btree ("auth_user_id");