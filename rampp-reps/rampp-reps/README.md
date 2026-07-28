# Rampp Reps

Instagram DM outreach tracker for GAA club reps.

Screens: **Today** (follow-ups due), **Add** (new lead), **Pipeline** (everything by status).

- Next.js 15 (Appgggg Router) · Supabase (auth + Postgres) · Vercel
- Database: project `mtffmetaoneyadhlsgey`
- Statuses: Not messaged → Sent → Follow up → Link sent, or Closed at any point
- A Sent lead with no reply after 14 days is marked cold and can be bulk-closed
- Dates run on Europe/Dublin, not the server's UTC clock

## Environment variables

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://mtffmetaoneyadhlsgey.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API Keys → anon/publishable |

Both are safe in the browser. Row level security is what protects the data, so
there is no secret key in this app.

## Local development

```bash
cp .env.example .env.local   # fill in the anon key
npm install
npm run dev
```

## Adding a third user

Supabase dashboard → Authentication → Users → Add user (with a password).
A profile row is created automatically. Rename them under Table Editor → profiles.
