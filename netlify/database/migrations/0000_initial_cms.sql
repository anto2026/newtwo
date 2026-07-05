CREATE TABLE IF NOT EXISTS "site_settings" (
  "id" serial PRIMARY KEY NOT NULL,
  "logo_text" text DEFAULT 'Kestrel Market' NOT NULL,
  "logo_url" text DEFAULT '' NOT NULL,
  "footer_text" text DEFAULT 'Local goods, packed with care.' NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "categories" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS "homepage_sections" (
  "id" serial PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "subtitle" text DEFAULT '' NOT NULL,
  "body" text DEFAULT '' NOT NULL,
  "image_url" text DEFAULT '' NOT NULL,
  "cta_label" text DEFAULT 'Shop now' NOT NULL,
  "cta_href" text DEFAULT '/#products' NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS "products" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "description" text DEFAULT '' NOT NULL,
  "image_url" text DEFAULT '' NOT NULL,
  "price" numeric(10, 2) NOT NULL,
  "category_id" integer REFERENCES "categories"("id") ON DELETE SET NULL,
  "stock" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS "orders" (
  "id" serial PRIMARY KEY NOT NULL,
  "customer_name" text NOT NULL,
  "customer_email" text NOT NULL,
  "customer_phone" text DEFAULT '' NOT NULL,
  "delivery_address" text NOT NULL,
  "payment_method" text DEFAULT 'local_payment_pending' NOT NULL,
  "items" jsonb NOT NULL,
  "total" numeric(10, 2) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

INSERT INTO "site_settings" ("id", "logo_text", "footer_text")
VALUES (1, 'Kestrel Market', 'Guest checkout today. Local payment integration is reserved for a later release.')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "categories" ("name", "slug", "sort_order") VALUES
  ('Pantry', 'pantry', 1),
  ('Home Goods', 'home-goods', 2),
  ('Gifts', 'gifts', 3)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "homepage_sections" ("title", "subtitle", "body", "image_url", "cta_label", "cta_href", "sort_order") VALUES
  ('Everyday goods with a local point of view', 'Guest checkout, no account required', 'Browse practical products, add them to your cart, and place an order for local payment confirmation.', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80', 'Browse products', '/#products', 1),
  ('Built for changing inventory', 'CMS managed homepage', 'Admins can update logo, footer, categories, and homepage sections without touching code.', 'https://images.unsplash.com/photo-1556742111-a301076d9d18?auto=format&fit=crop&w=1600&q=80', 'View categories', '/#categories', 2)
ON CONFLICT DO NOTHING;

INSERT INTO "products" ("name", "slug", "description", "image_url", "price", "category_id", "stock", "sort_order") VALUES
  ('Stoneground Breakfast Blend', 'stoneground-breakfast-blend', 'A balanced pantry staple for slow mornings and busy counters.', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80', 18.75, 1, 24, 1),
  ('Charcoal Linen Basket', 'charcoal-linen-basket', 'Structured storage with a quiet woven finish.', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80', 42.30, 2, 11, 2),
  ('Pressed Citrus Gift Set', 'pressed-citrus-gift-set', 'A bright boxed set for hosts, neighbors, and overdue thank-yous.', 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=80', 31.40, 3, 17, 3)
ON CONFLICT ("slug") DO NOTHING;
