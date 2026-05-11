# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Dev Server**: `npm run dev` (Vite)
- **Production Build**: `npm run build`
- **Local Preview**: `npm run preview`
- **Linting**: `npm run lint`
- **Formatting**: `npm run format`

## Architecture & Structure

### High-Level Stack

- **Frontend**: React 19 + TanStack Router (file-based) + TanStack Query v5.
- **Styling**: Tailwind CSS v4 with a bespoke OKLCH design system (Obsidian/Gold theme).
- **Backend**: Supabase (Postgres, Auth, Edge Functions).
- **Deployment**: Cloudflare Pages via Wrangler.

### Core Project Layout

- `src/routes/`: File-based routing using TanStack Router. Pages are defined here.
- `src/components/`: Shared React components. `src/components/ui/` contains shadcn/ui primitives.
- `src/lib/`: Business logic and state management.
  - `useCart.ts`, `useWishlist.ts`, `useCompare.tsx`: Persistent state via `localStorage`.
  - `i18n.tsx` & `currency.tsx`: Handle internationalization (EN/VI/KO) and currency conversion (USD/VND/KRW).
- `src/integrations/supabase/`: Supabase client configuration and auth middleware.
- `supabase/functions/`: Edge functions for AI-powered features (Beauty Advisor, Skin Quiz, Recommendations).

### Database Design

- Uses Supabase (PostgreSQL) with Row Level Security (RLS).
- Key tables: `products`, `categories`, `orders`, `order_items`, `reviews`.
- Public read access is typically restricted to `products` and `categories`.

### Design System

- Uses a custom theme defined via CSS variables in `src/styles.css`.
- Key utilities: `.text-gold` (gradients), `.glass` (frosted effect), `.luxe-card` (dark gradient), `.reveal-on-scroll` (IntersectionObserver animations).
