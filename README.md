# Lisa — Ties & Scarves Storefront

A lightweight e-commerce storefront built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma and NextAuth. Customers build a cart, then **order on WhatsApp** — the site saves the order and opens a chat with the full order pre-filled. There is no online payment gateway.

## Features

- **Public storefront**: home page with announcement bar & product grid, product detail pages (gallery, size/variant selector, JSON-LD), collection pages (`/shop/[category]`), cart, contact page, custom 404
- **WhatsApp checkout (the only checkout path)**: `POST /api/checkout` validates the cart, re-prices every line from the database, stores the order as `pending_whatsapp` and returns a `wa.me` deep link containing the order summary (reference, items, sizes, quantities, prices, total, delivery details). The confirmation page re-offers the same link in case a browser blocked the pop-up.
- **Admin dashboard** (`/admin`, NextAuth credentials login): overview stats, products CRUD with image upload, categories CRUD, orders view with status filters and confirm/fulfil actions, plus editable site settings (WhatsApp number, announcement bar, address)
- **SEO**: dynamic metadata per page, Open Graph/Twitter cards, `generateStaticParams` for products/categories, dynamic `sitemap.xml` & `robots.txt`, Product JSON-LD
- Mobile-first responsive design; image upload to `/public/uploads` in dev, Cloudinary when configured

## Branding

Everything brand-facing comes from one file — `src/lib/site.ts`:

```ts
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Lisa";
export const SITE_TAGLINE = "Ties & Scarves";
export const SITE_ADDRESS = "Abuja, Nigeria";
```

Change the values there (or set `NEXT_PUBLIC_SITE_NAME`) and the metadata, Open Graph tags, product JSON-LD, footer, admin login screen and order references all follow.

**Logo:** the header/footer render `<Wordmark />` (`src/components/wordmark.tsx`) — a simple text wordmark. To swap in a real logo, drop the file in `/public` and replace the `<span>` inside `Wordmark` with an `<Image>` (instructions are in the component comment).

## Colour scheme

Colours are design tokens in `tailwind.config.ts` — change them once and the whole site picks them up:

| Token | Value | Used for |
| --- | --- | --- |
| `bone` | `#ffffff` | base surface (page background, header) |
| `ink` | `#111111` | text and dark detail work |
| `accent` | `#FF2D87` | buttons, links, highlights, badges |
| `accent-dark` | `#DB1A69` | accent hover state |

White stays the dominant surface; the accent is used for calls to action. Button/input styling (`btn-primary`, `btn-outline`, `input`) lives in `src/app/globals.css`.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill it in:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="a-long-random-string"
ADMIN_EMAIL="admin@lisaties.com"
ADMIN_PASSWORD="change-me"
NEXT_PUBLIC_WHATSAPP_NUMBER="2348012345678"
NEXT_PUBLIC_SITE_NAME="Lisa"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Optional — when unset, uploads fall back to /public/uploads (dev only)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

No payment-gateway keys are required — nothing in the app reads one.

### 3. Database + seed

```bash
npx prisma db push   # create/sync tables
npm run db:seed      # demo ties/scarves catalogue, settings + admin account
```

The seed is idempotent and never overwrites rows that already exist. Seeded product images are placeholders (`placehold.co`) — upload the real photos in **Admin → Products**.

### 4. Run

```bash
npm run dev
```

- Storefront: http://localhost:3000
- Admin login: http://localhost:3000/admin/login (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)

## Upgrading an existing store to Lisa

`scripts/rebrand-db.ts` cleans up a database seeded before the rebrand. It is idempotent and only touches saved settings and the admin login:

```bash
npx tsx scripts/rebrand-db.ts
```

It removes stray setting rows (the previous brand's payment-gateway keys), rewrites the Instagram/email/address/announcement rows to the Lisa defaults, moves the admin login onto `ADMIN_EMAIL`, and lists catalogue items still left over from the old store so you can replace them in the admin dashboard.

If the schema changed (the order table dropped a legacy payment-reference column), sync it with:

```bash
npx prisma db push
```

## Deploying to Vercel

1. Create a managed PostgreSQL database (Vercel Postgres, Neon, Supabase, Railway…).
2. Set `DATABASE_URL` plus the other env vars from `.env.example` in the Vercel project.
3. Push the schema and (optionally) seed once from your machine: `npx prisma db push && npm run db:seed`.
4. Set `NEXTAUTH_URL` to your Vercel URL.
5. `generateStaticParams` is resilient — if the database isn't reachable during the build it returns an empty list instead of failing. Note that pages themselves *are* prerendered from live data, so make sure the database is awake during a production build (a serverless Postgres that has scaled to zero can intermittently fail the prerender step).

### Image storage

Product images are stored as **URLs** in the database — no binary files in the repo. Admin uploads go to:

- **Cloudinary** (folder `lisa`) when `CLOUDINARY_*` env vars are set — use this on Vercel.
- Local `/public/uploads` as a development fallback only (files there won't persist on Vercel).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Build for production (runs `prisma generate`) |
| `npm run db:push` | Sync Prisma schema to database |
| `npm run db:seed` | Seed demo catalogue + settings + admin user |
| `npm run db:studio` | Browse data in Prisma Studio |

## Project structure

```
src/
├── app/
│   ├── page.tsx                 # Home
│   ├── shop/                    # Shop + /shop/[category]
│   ├── product/[slug]/          # Product detail (+ JSON-LD, SSG params)
│   ├── cart/, checkout/, order/[id]/
│   ├── contact/, not-found.tsx
│   ├── sitemap.ts, robots.ts, layout.tsx
│   ├── admin/                   # Protected dashboard (layout, actions, CRUD pages)
│   └── api/
│       ├── checkout/route.ts            # Creates the order + builds the WhatsApp link
│       └── admin/upload/route.ts        # Authenticated image uploads
├── components/                  # Header, footer, wordmark, cart context, forms…
└── lib/                         # prisma, auth, settings, site (brand), whatsapp, validation
```


