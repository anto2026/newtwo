import { boolean, integer, jsonb, numeric, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  logoText: text("logo_text").notNull().default("Kestrel Market"),
  logoUrl: text("logo_url").notNull().default(""),
  footerText: text("footer_text").notNull().default("Local goods, packed with care."),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true)
});

export const homepageSections = pgTable("homepage_sections", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  body: text("body").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  ctaLabel: text("cta_label").notNull().default("Shop now"),
  ctaHref: text("cta_href").notNull().default("/#products"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true)
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  stock: integer("stock").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0)
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull().default(""),
  deliveryAddress: text("delivery_address").notNull(),
  paymentMethod: text("payment_method").notNull().default("local_payment_pending"),
  items: jsonb("items").notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
