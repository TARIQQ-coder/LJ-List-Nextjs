# LJ-list API — Express + MongoDB

Drop-in replacement for `lj-list-api.onrender.com`. Serves **both** the Next.js storefront and the Vite admin panel with the exact request/response contracts they already use.

## 1. Setup

You need MongoDB. Either:

- **MongoDB Atlas (recommended, free)** — create a free M0 cluster at mongodb.com/atlas, create a database user, allow your IP, copy the connection string.
- **Local install** — install MongoDB Community Server, it runs at `mongodb://127.0.0.1:27017`.

Then:

```bash
cp .env.example .env      # edit MONGODB_URI + JWT_SECRET
npm install
npm run seed              # admin user + categories + 42 products + 7 packages
npm run dev               # http://localhost:8080
```

Seed creates an admin: **+233240000001 / admin1234** (override with `SEED_ADMIN_PHONE` / `SEED_ADMIN_PASSWORD`; change it after first login). `npm run seed -- --fresh` wipes and reseeds the catalog.

**OTP codes are printed to the server console** until you plug in an SMS provider (see the `issueOtp` function in `src/routes/auth.mjs` — Hubtel, Arkesel, or Twilio slot in there).

## 2. Point the frontends at it

**Storefront** (`ljlist-next/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**Admin** (`admin/.env`):
```
VITE_API_URL=http://localhost:8080
```
(The admin's Vite dev server proxies `/api` to that target — already configured in its `vite.config.ts`.)

Restart both dev servers after changing env files.

## 3. Full local test flow

1. `npm run dev` here (port 8080), storefront on 3000, admin on 5173.
2. Storefront: register → the OTP appears in **this terminal** → verify → you're signed in.
3. Add products to cart → submit an application at the bottom of the home page.
4. Admin: log in with the seeded admin → Applications → approve/decline; Conversations → reply to customer messages.

## 4. Endpoints

Auth is cookie-based (`lj_access` 15 min / `lj_refresh` 30 days, httpOnly). `POST /api/v1/auth/refresh` rotates both — both frontends call it automatically on 401.

Success envelope: `{ data, message?, meta? }` · Errors: `{ message, errors: {field: [..]}, code, request_id }`

| Area | Endpoints |
| --- | --- |
| Auth | `POST /api/v1/auth/signup · login · verify-otp · resend-otp · refresh · logout` |
| Profile | `GET/PATCH /api/v1/profile` |
| Products | `GET /api/v1/products`, `GET /products/:id`, `GET /products/categories` |
| Packages | `GET /api/v1/packages`, `/packages/fixed · provisions · detergents` |
| Applications | `POST/GET /api/v1/applications`, `GET /applications/:id` |
| Conversations | `POST/GET /api/v1/conversations`, `GET/POST /conversations/:id/messages` |
| Admin auth | `POST /api/v1/admin/auth/login` (role must be admin) |
| Admin users | `GET /admin/users`, `GET/PATCH /admin/users/:id` |
| Admin categories | `GET/POST /admin/categories`, `GET/PATCH/DELETE /admin/categories/:id` |
| Admin products | CRUD `/admin/products`, images `GET/POST /admin/products/:id/images` (multipart field `images`), `DELETE .../images/:imageId` |
| Admin packages | `GET /admin/packages`, `GET/POST/PATCH/DELETE /admin/packages/:type/:id`, `PATCH .../reactivate` |
| Admin applications | `GET /admin/applications?status=`, `GET/PATCH /admin/applications/:id` |
| Admin conversations | `GET /admin/conversations`, `POST /admin/conversations/:id/messages` |
| Admin dashboard | `GET /admin/dashboard?range=week|month|quarter|year` |
| Settings | `PATCH /admin/settings/min-order` |

## 5. Behaviour notes

- **Application submission** snapshots cart items (name/price/subtotal) and delivery details, computes `total_amount`, enforces the `min_order` setting (seeded at GH₵300), sets `monthly_amount = total / 3`, and back-fills the user's profile defaults (staff number, institution, Ghana Card, address).
- **Deletes are soft** for products and packages (`active: false`) so past applications keep their history; packages have a reactivate endpoint.
- **Conversations**: one thread per customer with "support". Opening a thread marks the other side's messages read; unread counts power the badges in both apps.
- **Uploads** are stored on disk in `uploads/` and served at `/uploads/*` with absolute URLs built from `PUBLIC_URL`.
- **Ghanaian phone numbers**: `024xxxxxxx` is auto-normalized to `+23324xxxxxxx`.

## 6. Production checklist

- Set a long random `JWT_SECRET`; set `COOKIE_SECURE=true` behind HTTPS.
- If the API and frontends are on **different domains**, set `COOKIE_SAMESITE=none` (requires secure cookies) and list the frontend origins in `CORS_ORIGINS`.
- Deploy anywhere Node runs (Render, Railway, a VPS). On hosts with ephemeral disks, move `uploads/` to S3/Cloudinary — the upload handler in `src/routes/admin/index.mjs` is the single place to change.
- Wire a real SMS provider into `issueOtp`.

## Project layout

```
src/
  index.mjs          boot (connect DB, listen)
  app.mjs            express app, CORS, routes, error handler
  config.mjs         env config
  models/index.mjs   User, Category, Product, Package, Application,
                     Conversation, Message, Setting + serializers
  middleware/auth.mjs  requireAuth / requireAdmin
  routes/            auth, profile, products, packages, applications,
                     conversations, admin/ (everything admin)
  utils/             respond (envelope + errors), tokens (JWT cookies), pagination
  seed.mjs           demo data + admin user
```
