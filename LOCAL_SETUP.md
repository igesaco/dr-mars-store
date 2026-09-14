# Dr Mars — local setup

The e-commerce app runs on Next.js/Node and the existing `dr_mars` PostgreSQL database. Do not use the old Cloudflare/Vinext dev command for database operations. The public demo is separate from local development.

1. In `.env.local` set the three keys shown in `config.example.env`. Preserve your existing DATABASE_URL; choose an admin password and generate a random `ADMIN_SESSION_SECRET` (32+ characters). The password must be the actual password accepted by PostgreSQL; do not share it in chat or commit `.env.local`.
2. Run `corepack pnpm install` then `corepack pnpm db:migrate`. Migration targets the database named `dr_mars` from `DATABASE_URL` and creates the required tables. Make a backup before schema changes if that database already contains real records.
3. Run `corepack pnpm dev` and visit `http://localhost:5173/yonetici-giris`. The dashboard is protected by the local administrator password.
4. Add products under `http://localhost:5173/admin/urunler`.

Important: other e-commerce, SEO and design cards are still planning screens; payments and customer checkout are not connected yet. Do not expose this app to the internet until the end-to-end order, authentication and payment review is complete. The previous Sites preview remains a separate static demo.
