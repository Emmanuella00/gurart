# GURArt — African Art Marketplace

Story-driven marketplace connecting verified African artists with buyers worldwide.
**Live:** https://gurart.vercel.app | **Stack:** Next.js · Supabase · Cloudinary · Vercel

---

## Requirements
- Node.js 18+, Git
- Free accounts on [Supabase](https://supabase.com), [Cloudinary](https://cloudinary.com), [Vercel](https://vercel.com)

---

## Setup

**1. Clone & install**
```bash
git clone https://github.com/Emmanuella00/gurart.git
cd gurart && npm install && cp .env.local.example .env.local
```

**2. Supabase** — create a project, then in SQL Editor run:
- `supabase_schema.sql` — creates all tables, auth trigger, and base RLS policies
- `supabase_day2.sql` — adds the orders table and admin role setup
- Copy the 3 policy fix queries from `SETUP_DAY2.md` and run them too
- Get your keys from **Settings → API** (Project URL + anon public key)
- Add redirect URLs under **Authentication → URL Configuration**:
  ```
  http://localhost:3000/**
  https://your-app.vercel.app/**
  ```

**3. Cloudinary** — in your dashboard:
- Note your **Cloud name**
- Go to **Settings → Upload → Upload presets → Add upload preset**
- Name: `gurart_unsigned` · Signing mode: `Unsigned` · Folder: `gurart`

**4. Fill in `.env.local`**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=gurart_unsigned
```

**5. Run locally**
```bash
npm run dev   # → http://localhost:3000
```

**6. Create admin account**
Register at `/auth/register`, then run in Supabase SQL Editor:
```sql
update public.profiles set role = 'admin' where email = 'your@email.com';
```
Log in and you'll be redirected to `/admin`.

**7. Deploy to Vercel**
Import your GitHub repo at vercel.com, add the 4 env vars, click **Deploy**.
Every `git push` auto-redeploys — no manual steps needed.

---

## User Roles
| Role | Access |
|------|--------|
| Buyer | Browse gallery, view artists, purchase artworks |
| Artist | Upload artworks, manage profile and dashboard |
| Admin | Approve/reject submissions, verify artists |

---

## Troubleshooting
| Problem | Fix |
|---------|-----|
| API / blank page error | Check `.env.local` values, restart dev server |
| `relation "orders" does not exist` | Run `supabase_day2.sql` in SQL Editor |
| `violates foreign key constraint` | Re-register or run the profiles seed from `SETUP_DAY2.md` |
| Admin panel redirects to home | Run the role update SQL in Step 6 |
| Browse page is empty | Log in as admin and approve artworks at `/admin` |
| Email link goes to localhost | Add your Vercel URL to Supabase redirect URLs |

---

*GURArt — African Leadership University — Kigali, Rwanda — 2026*
