CREATE TABLE "classes_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" text NOT NULL,
	"class_name" text NOT NULL,
	"school_year" text NOT NULL,
	"semester" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "classes_catalog_unique_idx" ON "classes_catalog" USING btree ("auth_user_id","class_name","school_year","semester");