# AlpaCash Frontend

Next.js 16 frontend for AlpaCash.

## Local setup

1. Create `Frontend/.env.local`
2. Add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Install dependencies and run:

```bash
npm install
npm run dev
```

## Vercel deployment

Deploy this app with **Root Directory = `Frontend`**.

Required environment variables in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Recommended project settings:

- Framework Preset: `Next.js`
- Root Directory: `Frontend`
- Install Command: `npm install`
- Build Command: `npm run build`
