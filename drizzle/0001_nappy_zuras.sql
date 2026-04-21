CREATE TABLE "attendance_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" text NOT NULL,
	"attendance_date" text NOT NULL,
	"class_name" text NOT NULL,
	"subject" text NOT NULL,
	"meeting" text NOT NULL,
	"entries" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" text NOT NULL,
	"entry_date" text NOT NULL,
	"hours" text NOT NULL,
	"class_name" text NOT NULL,
	"subject" text NOT NULL,
	"topic" text NOT NULL,
	"goal" text NOT NULL,
	"activity" text NOT NULL,
	"note" text,
	"status" text DEFAULT 'published' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "materials_library" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" text NOT NULL,
	"title" text NOT NULL,
	"class_name" text NOT NULL,
	"subject" text NOT NULL,
	"topic" text NOT NULL,
	"meeting" text NOT NULL,
	"description" text,
	"document_path" text,
	"external_link" text,
	"thumbnail_path" text,
	"type" text DEFAULT 'Link' NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_library" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" text NOT NULL,
	"title" text NOT NULL,
	"format" text NOT NULL,
	"linked_to" text,
	"file_path" text,
	"thumbnail_path" text,
	"size_label" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "score_registers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" text NOT NULL,
	"score_date" text NOT NULL,
	"class_name" text NOT NULL,
	"subject" text NOT NULL,
	"score_type" text NOT NULL,
	"meeting" text NOT NULL,
	"entries" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_library" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" text NOT NULL,
	"title" text NOT NULL,
	"class_name" text NOT NULL,
	"topic" text NOT NULL,
	"source" text NOT NULL,
	"video_url" text NOT NULL,
	"thumbnail_path" text,
	"linked_to" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_registers_unique_idx" ON "attendance_registers" USING btree ("auth_user_id","attendance_date","class_name","subject","meeting");--> statement-breakpoint
CREATE UNIQUE INDEX "score_registers_unique_idx" ON "score_registers" USING btree ("auth_user_id","score_date","class_name","subject","score_type","meeting");