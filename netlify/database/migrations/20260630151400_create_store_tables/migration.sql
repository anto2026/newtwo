CREATE TABLE IF NOT EXISTS "categories" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "homepage_sections" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"subtitle" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"cta_label" text DEFAULT 'Shop now' NOT NULL,
	"cta_href" text DEFAULT '/#products' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" serial PRIMARY KEY,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text DEFAULT '' NOT NULL,
	"delivery_address" text NOT NULL,
	"payment_method" text DEFAULT 'local_payment_pending' NOT NULL,
	"items" jsonb NOT NULL,
	"total" numeric(10,2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"description" text DEFAULT '' NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"price" numeric(10,2) NOT NULL,
	"category_id" integer,
	"stock" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "site_settings" (
	"id" serial PRIMARY KEY,
	"logo_text" text DEFAULT 'Kestrel Market' NOT NULL,
	"logo_url" text DEFAULT '' NOT NULL,
	"footer_text" text DEFAULT 'Local goods, packed with care.' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
