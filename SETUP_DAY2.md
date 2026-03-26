# GURArt – Day 2 Setup Guide

## What's new in Day 2

Copy these new files into your existing project:

```
pages/browse/index.js         ← Public gallery with search & filter
pages/artwork/[id].js         ← Artwork detail with story & buy button
pages/checkout/[id].js        ← Mock checkout form
pages/checkout/confirmation.js ← Order confirmation page
pages/admin/index.js          ← Admin panel (approve / reject artworks)
```

---

## STEP 1 — Copy the new files into your gurart project (keep same folder structure)

---

## STEP 2 — Add the orders table to Supabase

1. Supabase dashboard → SQL Editor → New query
2. Paste contents of supabase_orders.sql → Run

---

## STEP 3 — Make yourself an admin

In Supabase SQL Editor (replace with your email):

```sql
update public.profiles set role = 'admin' where email = 'your@email.com';
```

Then visit http://localhost:3000/admin

---

## STEP 4 — Test the full flow

1. Artist: upload an artwork → it shows as Pending on dashboard
2. Admin: go to /admin → select artwork → Approve & publish
3. Buyer: go to /browse → click artwork → Purchase → fill checkout → see confirmation

---

## Common issues

- Browse page empty → Approve an artwork in /admin first
- Admin redirects to home → Run the SQL to set your role to 'admin'
- [id].js not found → File must be literally named [id].js with square brackets
- Orders table error → Run supabase_orders.sql. Checkout falls back gracefully anyway.

---

## Day 3 preview

- Push to GitHub
- Deploy to Vercel (5 minutes, free)
- Set environment variables in Vercel dashboard
- Final responsive polish
- Live URL — you're done!
