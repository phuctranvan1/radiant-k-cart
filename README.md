<div align="center">

# ✨ GLOW — Luxury Korean Beauty Boutique

**A premium, full-featured K-beauty e-commerce experience built with cutting-edge web technology.**

[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-2.x-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Cloudflare](https://img.shields.io/badge/Deploy-Cloudflare_Pages-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com)

<br />

> *"Beauty is not a routine — it's a ritual."*

</div>

---

## 🌟 Overview

**GLOW** is a meticulously crafted luxury Korean beauty e-commerce storefront. It blends a cinematic obsidian-and-gold design language with a rich set of modern e-commerce features — from AI-powered product recommendations and a skin-type quiz to multi-currency support, a loyalty programme, and a full PWA experience.

The store offers an immersive shopping journey: parallax hero, animated stats counters, smooth scroll-reveal sections, curated testimonials, and a globally consistent dark/light theme.

---

## 🎨 Features

### 🛒 Core Shopping
| Feature | Description |
|---|---|
| **Product catalogue** | Full grid with search, category filter, sort, and price-range slider |
| **Product detail page** | Image gallery, reviews, size guide, subscribe-and-save, live viewer badge |
| **Shopping cart** | Persistent cart via `localStorage`, quantity controls, promo codes |
| **Checkout** | Multi-step form with address, payment (demo), and order confirmation |
| **Wishlist** | Heart toggle on every card; persisted to `localStorage`; dedicated page |
| **Compare bar** | Pin up to 3 products and compare side-by-side |
| **Quick View** | Modal peek without leaving the current page |
| **Order lookup** | Track any order by order number and email |

### 🌏 Internationalisation & Currency
- **3 locales**: English, Vietnamese (`vi`), Korean (`ko`)
- **3 currencies**: USD, VND, KRW — live conversion with persistent preference
- Locale and currency switcher in the header, saved to `localStorage`

### 💡 Discovery & Personalisation
- **AI Beauty Advisor** — embedded chat widget with smart product suggestions
- **Skin Quiz** — 5-step questionnaire that persists recommended product IDs
- **For You section** — personalised feed combining quiz results, wishlist, and recently viewed
- **Lookbook** — editorial lifestyle page
- **Bundles** — curated product sets at a bundled price

### 🏆 Loyalty & Growth
- **Rewards programme** — point accumulation, tier tracking, redemption
- **Referral system** — unique referral links, tracking via URL `?ref=` param
- **Subscriptions** — subscribe & save on replenishable products
- **Newsletter** — email capture with client-side validation

### 🎯 UI / UX Highlights
- **Cinematic hero** with parallax scroll, floating ambient orbs, and sparkle dots
- **Animated stats counters** that count up on scroll into view
- **Community testimonials** with star ratings and product attribution
- **Brand marquee** — infinite scroll of curated brand names
- **Trust bar** — free shipping, authenticity, cruelty-free, AI advisor
- **Scroll-reveal** — IntersectionObserver-driven staggered entry animations
- **Dark / Light theme** — obsidian-gold dark and champagne-pearl light palettes
- **Command palette** (`⌘K`) — keyboard-first navigation and search
- **Cursor particles** — subtle sparkle trail on mouse movement
- **Back-to-top** button with spring animation
- **Hide-on-scroll header** — reappears on upward scroll

### 🔐 Auth & Admin
- Supabase Auth (email/password)
- Admin dashboard: manage products, orders, categories
- Route-level auth guards

### 📱 PWA
- Installable on mobile and desktop
- `manifest.json` + service worker via Vite plugin
- Offline-ready shell

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev) + [TanStack Router](https://tanstack.com/router) (file-based routing) |
| **Build tool** | [Vite 7](https://vitejs.dev) + `@cloudflare/vite-plugin` |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) + custom OKLCH design tokens |
| **UI components** | [shadcn/ui](https://ui.shadcn.com) (Radix primitives + class-variance-authority) |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Backend / DB** | [Supabase](https://supabase.com) (Postgres + Auth + Realtime) |
| **Deployment** | [Cloudflare Pages](https://pages.cloudflare.com) via `wrangler` |
| **State** | React context + `localStorage` hooks |
| **Forms** | React Hook Form + Zod |
| **Data fetching** | TanStack Query v5 |
| **Fonts** | Cormorant Garamond (display) + Inter (sans) via Google Fonts |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 20 (or [Bun](https://bun.sh))
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone & install

```bash
git clone https://github.com/phuctranvan1/radiant-k-cart.git
cd radiant-k-cart
npm install          # or: bun install
```

### 2. Configure environment

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Build for production

```bash
npm run build
```

Static output goes to `dist/`. Deploy to Cloudflare Pages or any static host.

---

## 🗂️ Project Structure

```
radiant-k-cart/
├── public/                  # Static assets (manifest, icons, sw)
├── src/
│   ├── assets/              # Images (hero, etc.)
│   ├── components/          # Shared React components
│   │   ├── ui/              # shadcn/ui primitives
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── StatsSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── NewsletterSignup.tsx
│   │   ├── ChatWidget.tsx
│   │   ├── CommandPalette.tsx
│   │   ├── CursorParticles.tsx
│   │   └── ...
│   ├── hooks/               # Utility React hooks
│   ├── lib/                 # Business logic
│   │   ├── auth.tsx         # Supabase auth context
│   │   ├── useCart.ts       # Shopping cart (localStorage)
│   │   ├── useWishlist.ts   # Wishlist (localStorage)
│   │   ├── useCompare.tsx   # Product compare (localStorage)
│   │   ├── useLoyalty.ts    # Loyalty points
│   │   ├── useReferral.ts   # Referral tracking
│   │   ├── i18n.tsx         # Internationalisation (EN/VI/KO)
│   │   └── currency.tsx     # Currency conversion (USD/VND/KRW)
│   ├── routes/              # File-based TanStack Router pages
│   │   ├── index.tsx        # Home page
│   │   ├── products.index.tsx
│   │   ├── products.$slug.tsx
│   │   ├── categories.$slug.tsx
│   │   ├── cart.tsx
│   │   ├── checkout.tsx
│   │   ├── wishlist.tsx
│   │   ├── account.tsx
│   │   ├── admin.tsx
│   │   └── ...
│   ├── integrations/
│   │   └── supabase/        # Supabase client, types, auth middleware
│   └── styles.css           # Global styles (OKLCH tokens, animations)
├── supabase/                # DB migrations & edge functions
├── vite.config.ts
└── wrangler.jsonc           # Cloudflare deployment config
```

---

## 🎨 Design System

GLOW uses a bespoke design system built on top of Tailwind CSS v4's native CSS variable theming.

### Colour palette

| Token | Dark (default) | Light |
|---|---|---|
| `--background` | `oklch(0.16 0.012 60)` — Obsidian | `oklch(0.985 0.006 85)` — Pearl |
| `--gold` | `oklch(0.82 0.15 82)` — Warm gold | `oklch(0.58 0.14 70)` — Deep gold |
| `--card` | `oklch(0.20 0.012 60)` | `oklch(1 0 0)` — White |

### Key CSS utilities

```css
.text-gold          /* Gradient gold text */
.text-gold-shine    /* Animated shimmer gold */
.glass              /* Frosted glass effect */
.luxe-card          /* Dark gradient card with gold hover */
.btn-luxe           /* Button with shimmer sweep on hover */
.orb                /* Ambient blurred glow sphere */
.sparkle-dot        /* Floating sparkle particle */
.reveal-on-scroll   /* IntersectionObserver reveal */
.gold-ring          /* Gradient border pseudo-element */
```

---

## 🗄️ Database (Supabase)

### Tables

| Table | Purpose |
|---|---|
| `products` | Product catalogue (name, slug, brand, price, images, rating, etc.) |
| `categories` | Product categories with slug, description, sort_order |
| `orders` | Customer orders (user_id, items JSON, status, totals) |
| `order_items` | Individual line items per order |
| `reviews` | Product reviews (rating, body, user_id) |

All tables use Row Level Security (RLS). Anon key has read-only access to `products` and `categories`.

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |

---

## 🌐 Deployment

### Cloudflare Pages (recommended)

1. Push to GitHub
2. Connect repo in the Cloudflare dashboard
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

Alternatively, deploy with Wrangler:

```bash
npx wrangler pages deploy dist
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push the branch: `git push origin feature/my-feature`
5. Open a pull request

Please follow the existing code style (ESLint + Prettier configs are included).

---

## 📄 License

MIT © GLOW Beauty — Built with ❤️ from Seoul to the world.

---

<div align="center">

**[Shop the Edit](https://glow.beauty)** · **[Our Story](/about)** · **[Skin Quiz](/skin-quiz)**

*Authentic K-beauty, handpicked from Seoul's most coveted ateliers.*

</div>
