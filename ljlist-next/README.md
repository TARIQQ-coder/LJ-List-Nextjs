# LJ-list — Next.js Storefront

Customer-facing LJ-list grocery store, ported from Vite + React to **Next.js 15 (App Router)** with React 19 and Tailwind CSS v4. All components, styling, cart logic, auth flows, and the API layer were carried over intact.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # serve production build
```

## Environment

`.env.local`:

```
NEXT_PUBLIC_API_URL=https://lj-list-api.onrender.com
```

Point this at your own backend once it's built (e.g. `http://localhost:8080`). The API client (`src/api/client.ts`) uses cookie-based auth with automatic refresh on 401, same as before.

## Structure

```
src/
  app/                    # Next.js App Router routes
    page.tsx              # Home (packages, featured grid, shop, apply form)
    products/[productId]/ # Product detail
    packages/[packageId]/ # Fixed package detail
    cart/                 # Full cart page
    auth/login|register|otp-verify/
    profile/              # Overview / applications / messages
  components/home/        # Route-level wrappers (StoreHome, AccountRoute…)
  store/StoreProvider.tsx # Global state: catalog, cart, user (was App.tsx state)
  lib/router.tsx          # react-router → next/navigation compatibility shim
  api/                    # API modules (auth, products, packages, applications…)
  features/               # Catalog, cart, checkout, auth, account, packages UI
  layout/                 # Navbar, Hero, Footer, TrustBar, WhatsAppFloat…
  utils/  data/  styles/
```

## Notes on the port

- **Routing** — `react-router-dom` was replaced by a thin shim (`src/lib/router.tsx`) exposing `Link`, `useNavigate`, `useParams`, `useSearchParams`, and `<Navigate/>` on top of `next/navigation`, so feature components required almost no changes.
- **State** — everything that lived in the old root `App.tsx` (catalog, cart, user/profile, search, prefilled package) now lives in `StoreProvider`, a client context wrapping the whole app in `app/layout.tsx`. Cart state survives client-side navigation between all pages.
- **Env vars** — `import.meta.env.VITE_API_URL` → `process.env.NEXT_PUBLIC_API_URL`.
- **Unknown routes** redirect to `/` (matching the old `*` catch-all).

## Next step: the backend

The plan is to replace the hosted `lj-list-api.onrender.com` with our own API implementing:

- `POST /api/v1/auth/signup | login | verify-otp | resend-otp | refresh | logout` (cookie sessions + OTP)
- `GET/PATCH /api/v1/profile`
- `GET /api/v1/products`, `/products/:id`, `/products/categories`
- `GET /api/v1/packages`, `/packages/fixed | provisions | detergents`
- `POST/GET /api/v1/applications`, `/applications/:id`
- `POST/GET /api/v1/conversations`, `/:id/messages`

It can be built either as Next.js Route Handlers inside this app (single deploy) or as a standalone Node/Express + Postgres service (keeps the existing admin panel pointing at one API). The `server/` stub in your original project can serve as the seed for the standalone option.
