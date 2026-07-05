# Project Notes

This is a Next.js App Router commerce CMS. Public customers never authenticate: the cart is stored in browser local storage, and checkout writes a guest order record.

## Architecture

- `app/page.tsx` renders the public storefront from CMS data.
- `app/actions.ts` contains server actions for admin login, CMS mutations, storefront reads, and guest order placement.
- `app/admin` contains the admin-only login and dashboard.
- `app/components` contains client components for cart behavior and add-to-cart interactions.
- `db/schema.ts` defines the Netlify Database schema with Drizzle.
- `netlify/database/migrations` contains SQL migrations applied by Netlify.

## Conventions

- Use Netlify Database for persistent records. Do not add Supabase or local JSON persistence in this environment.
- Only the admin area uses authentication. Do not add customer login or signup flows.
- Admin password validation must compare form data against `process.env.ADMIN_PASSWORD` inside server actions.
- Checkout intentionally has no Stripe or payment gateway. Keep the local payment placeholder until payment requirements are provided.
- Homepage sections use `sort_order` to control frontend order.
