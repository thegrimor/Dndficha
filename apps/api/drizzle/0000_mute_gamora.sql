CREATE TABLE "catalog_cache" (
	"key" text PRIMARY KEY NOT NULL,
	"payload" jsonb NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"race" text,
	"class" text,
	"level" integer DEFAULT 1 NOT NULL,
	"background" text,
	"alignment" text,
	"image_url" text,
	"edition" text DEFAULT '2014' NOT NULL,
	"core" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"source" text NOT NULL,
	"data" jsonb,
	"quantity" integer DEFAULT 1 NOT NULL,
	"equipped" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "share_links" (
	"character_id" uuid PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "share_links_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "known_spells" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"level" integer NOT NULL,
	"source" text NOT NULL,
	"data" jsonb,
	"prepared" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spell_books" (
	"character_id" uuid PRIMARY KEY NOT NULL,
	"slots" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "characters_owner_id_idx" ON "characters" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "inventory_items_character_id_idx" ON "inventory_items" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "known_spells_character_id_idx" ON "known_spells" USING btree ("character_id");