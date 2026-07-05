# Online WishList MVP

Universal wishlist MVP built with React, Vite, Supabase-ready auth/storage, and social sharing.

## Features

- Google and Facebook OAuth via Supabase Auth.
- User cabinet with profile, saved products, wishlist stats, and sign out.
- Save products from any online store by URL.
- Persistent cloud storage with Supabase tables when env vars are configured.
- Local demo mode when Supabase env vars are missing.
- Public wishlist links via `?wishlist=<share_token>`.
- Social sharing to Web Share API, WhatsApp, Telegram, and Facebook.
- Gift reservation from public product cards.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set these variables in `.env.local` and in Vercel Project Settings:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-or-anon-key
```

## Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor and run [`supabase/schema.sql`](supabase/schema.sql).
3. Enable Auth providers:
   - Google
   - Facebook
4. Add redirect URLs in Supabase Auth settings:
   - `http://localhost:5173`
   - your Vercel production URL
   - any custom domain you add later

The frontend uses `supabase.auth.signInWithOAuth({ provider })` for both providers.

## Deploy

```bash
npm run build
vercel --prod
```

If env vars are not configured in Vercel, the deployed app still runs in local demo mode, but real Google/Facebook auth and cloud storage require Supabase credentials.
