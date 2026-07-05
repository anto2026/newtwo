"use server";

import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, homepageSections, orders, products, siteSettings } from "@/db/schema";

const SESSION_COOKIE = "admin_auth";

export type ActionResult = {
  ok?: boolean;
  message?: string;
  error?: string;
};

function formDataFromArgs(first: FormData | ActionResult | undefined, second?: FormData) {
  return second ?? (first as FormData);
}

function cleanText(value: FormDataEntryValue | null, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function cleanSlug(value: FormDataEntryValue | null) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function cleanNumber(value: FormDataEntryValue | null, fallback = 0) {
  const number = Number(value ?? fallback);
  return Number.isFinite(number) ? number : fallback;
}

function getAuthSecret() {
  return process.env.AUTH_SECRET || process.env.NETLIFY_SITE_ID || "local-development-secret";
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function requireAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD is not configured.");
  }
  return password;
}

export async function isAdminAuthenticated() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return false;

  const [payload, signature] = raw.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return false;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp: number; role: string };
    return decoded.role === "admin" && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

export async function loginAdmin(_: { error?: string } | undefined, formData: FormData) {
  const submitted = String(formData.get("password") || "");
  const expected = requireAdminPassword();

  if (!submitted || !safeEqual(submitted, expected)) {
    return { error: "Invalid admin password." };
  }

  const payload = Buffer.from(JSON.stringify({ role: "admin", exp: Date.now() + 1000 * 60 * 60 * 8 })).toString("base64url");
  const jar = await cookies();
  jar.set(SESSION_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  redirect("/adminadminadmin");
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/adminadminadmin/login");
}

async function assertAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/adminadminadmin/login");
  }
}

export async function getStorefrontData() {
  const [settingsRows, categoryRows, sectionRows, productRows] = await Promise.all([
    db.select().from(siteSettings).limit(1),
    db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder), asc(categories.name)),
    db.select().from(homepageSections).where(eq(homepageSections.isActive, true)).orderBy(asc(homepageSections.sortOrder), asc(homepageSections.id)),
    db.select().from(products).where(eq(products.isActive, true)).orderBy(asc(products.sortOrder), asc(products.name))
  ]);

  return {
    settings: settingsRows[0] ?? { logoText: "Kestrel Market", logoUrl: "", footerText: "Local goods, packed with care." },
    categories: categoryRows,
    sections: sectionRows,
    products: productRows
  };
}

export async function fetchAllData() {
  await assertAdmin();
  const [settingsRows, categoryRows, sectionRows, productRows] = await Promise.all([
    db.select().from(siteSettings).limit(1),
    db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name)),
    db.select().from(homepageSections).orderBy(asc(homepageSections.sortOrder), asc(homepageSections.id)),
    db.select().from(products).orderBy(asc(products.sortOrder), asc(products.name))
  ]);

  return {
    settings: settingsRows[0] ?? { id: 1, logoText: "Kestrel Market", logoUrl: "", footerText: "" },
    categories: categoryRows,
    sections: sectionRows,
    products: productRows
  };
}

export const getAdminData = fetchAllData;

export async function saveSiteSettings(first: FormData | ActionResult | undefined, second?: FormData): Promise<ActionResult> {
  const formData = formDataFromArgs(first, second);
  await assertAdmin();
  try {
    const values = {
      id: 1,
      logoText: cleanText(formData.get("logoText"), "Kestrel Market"),
      logoUrl: cleanText(formData.get("logoUrl")),
      footerText: cleanText(formData.get("footerText"))
    };

    await db
      .insert(siteSettings)
      .values(values)
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: { ...values, updatedAt: new Date() }
      });
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/dashboard");
    return { ok: true, message: "Site settings saved." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Site settings could not be saved." };
  }
}

export const saveSettings = saveSiteSettings;

export async function createCategory(first: FormData | ActionResult | undefined, second?: FormData): Promise<ActionResult> {
  const formData = formDataFromArgs(first, second);
  await assertAdmin();
  try {
    const name = cleanText(formData.get("name"));
    const slug = cleanSlug(formData.get("slug"));
    if (!name || !slug) return { error: "Category name and slug are required." };

    await db.insert(categories).values({
      name,
      slug,
      sortOrder: cleanNumber(formData.get("sortOrder")),
      isActive: formData.get("isActive") === "on"
    });
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/dashboard");
    return { ok: true, message: "Category created." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Category could not be created." };
  }
}

export async function deleteCategory(first: FormData | ActionResult | undefined, second?: FormData): Promise<ActionResult> {
  const formData = formDataFromArgs(first, second);
  await assertAdmin();
  try {
    await db.delete(categories).where(eq(categories.id, cleanNumber(formData.get("id"))));
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/dashboard");
    return { ok: true, message: "Category deleted." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Category could not be deleted." };
  }
}

export async function createHomepageSection(first: FormData | ActionResult | undefined, second?: FormData): Promise<ActionResult> {
  const formData = formDataFromArgs(first, second);
  await assertAdmin();
  try {
    const title = cleanText(formData.get("title"));
    if (!title) return { error: "Section title is required." };

    await db.insert(homepageSections).values({
      title,
      subtitle: cleanText(formData.get("subtitle")),
      body: cleanText(formData.get("body")),
      imageUrl: cleanText(formData.get("imageUrl")),
      ctaLabel: cleanText(formData.get("ctaLabel"), "Shop now"),
      ctaHref: cleanText(formData.get("ctaHref"), "/#products"),
      sortOrder: cleanNumber(formData.get("sortOrder")),
      isActive: formData.get("isActive") === "on"
    });
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/dashboard");
    return { ok: true, message: "Homepage section created." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Homepage section could not be created." };
  }
}

export async function deleteHomepageSection(first: FormData | ActionResult | undefined, second?: FormData): Promise<ActionResult> {
  const formData = formDataFromArgs(first, second);
  await assertAdmin();
  try {
    await db.delete(homepageSections).where(eq(homepageSections.id, cleanNumber(formData.get("id"))));
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/dashboard");
    return { ok: true, message: "Homepage section deleted." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Homepage section could not be deleted." };
  }
}

export async function createProduct(first: FormData | ActionResult | undefined, second?: FormData): Promise<ActionResult> {
  const formData = formDataFromArgs(first, second);
  await assertAdmin();
  try {
    const name = cleanText(formData.get("name"));
    const slug = cleanSlug(formData.get("slug"));
    const price = cleanNumber(formData.get("price"));
    const categoryId = cleanNumber(formData.get("categoryId"));
    if (!name || !slug) return { error: "Product name and slug are required." };

    await db.insert(products).values({
      name,
      slug,
      description: cleanText(formData.get("description")),
      imageUrl: cleanText(formData.get("imageUrl")),
      price: price.toFixed(2),
      categoryId: categoryId || null,
      stock: cleanNumber(formData.get("stock")),
      sortOrder: cleanNumber(formData.get("sortOrder")),
      isActive: formData.get("isActive") === "on"
    });
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/dashboard");
    return { ok: true, message: "Product created." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Product could not be created." };
  }
}

export async function deleteProduct(first: FormData | ActionResult | undefined, second?: FormData): Promise<ActionResult> {
  const formData = formDataFromArgs(first, second);
  await assertAdmin();
  try {
    await db.delete(products).where(eq(products.id, cleanNumber(formData.get("id"))));
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/dashboard");
    return { ok: true, message: "Product deleted." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Product could not be deleted." };
  }
}

export async function placeGuestOrder(formData: FormData) {
  let items: Array<{ id: number; name: string; price: string; quantity: number }> = [];
  try {
    items = JSON.parse(String(formData.get("items") || "[]"));
  } catch {
    throw new Error("Cart contents could not be read.");
  }
  const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0).toFixed(2);

  await db.insert(orders).values({
    customerName: String(formData.get("customerName") || ""),
    customerEmail: String(formData.get("customerEmail") || ""),
    customerPhone: String(formData.get("customerPhone") || ""),
    deliveryAddress: String(formData.get("deliveryAddress") || ""),
    paymentMethod: "local_payment_pending",
    items,
    total
  });

  redirect("/checkout?status=received");
}
