# Kestrel Market

Kestrel Market is a dynamic e-commerce CMS built with Next.js App Router for Netlify. Customers browse products, add items to a local guest cart, and submit checkout orders without creating an account.

## Key technologies

- Next.js App Router
- React server actions
- Netlify Database with Drizzle ORM
- Netlify Next.js runtime
- Admin-only cookie authentication using `ADMIN_PASSWORD`

## Local development

Install dependencies, configure `ADMIN_PASSWORD`, then run the Next.js dev server:

```bash
npm install
npm run dev
```

On Netlify, database migrations in `netlify/database/migrations` are applied automatically. Set `ADMIN_PASSWORD` in the site environment before using `/admin/login`.
