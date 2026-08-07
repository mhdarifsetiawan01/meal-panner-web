# CLAUDE.md — meal-planner-web

Konteks proyek untuk AI coding assistant. Baca file ini SEBELUM membuat/mengubah kode apapun di repo ini.

## Tentang Proyek

Frontend monorepo untuk "MasakApa" — aplikasi rekomendasi menu masak berbasis AI. Ada 2 aplikasi dalam 1 repo: user app (end-user) dan admin panel. Backend terpisah di repo `meal-planner-api` (Go), konsumsi via REST API — lihat `docs/API_CONTRACT.md` untuk kontrak endpoint (copy dari repo backend, HARUS selalu sinkron).

## Tech Stack (WAJIB)

- **Turborepo** + pnpm workspaces
- **Next.js 16+** (App Router) + **TypeScript**
- **Tailwind CSS** untuk styling
- **Supabase JS Client** untuk auth (Google OAuth) — jangan bikin OAuth flow manual
- Deploy: **Vercel**, 2 project terpisah dari repo ini (root directory berbeda per app)

## Struktur Folder (WAJIB diikuti)

```
apps/
  user/                   → Next.js app end-user, deploy Vercel project #1
    app/
      onboarding/
      home/
      menu/
      shopping-list/
      price-watch/        → halaman Community Price Watch
      subscription/
  admin/                  → Next.js app admin panel, deploy Vercel project #2
    app/
      price-watch/         → CRUD campaign & item
      subscriptions/       → kelola plans & coupons
      ai-provider/          → switch AI provider aktif
packages/
  shared-types/           → TypeScript types (Recipe, Subscription, PriceSubmission, dll) — SATU sumber kebenaran, dipakai apps/user & apps/admin
  supabase-client/        → config & helper Supabase client, dipakai kedua app
  ui/                     → shared UI components (button, card, dll) jika ada duplikasi cukup banyak
docs/
  API_CONTRACT.md         → copy dari backend, kontrak endpoint
turbo.json
pnpm-workspace.yaml
```

## Aturan Penting

- **Jangan duplikasi types** — semua interface data (Recipe, Subscription, dll) HARUS didefinisikan sekali di `packages/shared-types`, di-import oleh kedua app. Kalau butuh type baru, cek dulu apakah sudah ada di sana.
- **Auth flow:** Supabase Auth handle Google OAuth di client. Setelah login, ambil JWT dari Supabase session, kirim sebagai `Authorization: Bearer <token>` ke semua request ke backend API.
- **Admin app** butuh guard tambahan: setelah login, cek `role` user dari backend (`GET /me` atau endpoint sejenis) — kalau bukan admin, redirect/block akses.
- **Fetching data:** pakai fetch native atau `@tanstack/react-query` untuk data dari backend API — jangan campur logic fetching langsung ke Supabase untuk data non-auth (semua data aplikasi lewat backend Go, Supabase cuma untuk auth + koneksi DB backend).
- **Env var per app** beda prefix kalau perlu (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) — lihat `.env.example` masing-masing app.

## Yang TIDAK Boleh Dilakukan AI Assistant Tanpa Konfirmasi

- Jangan bikin backend logic di Next.js API routes untuk data aplikasi (menu, subscription, dll) — semua itu tanggung jawab `meal-planner-api`, Next.js cuma consumer
- Jangan install state management library berat (Redux, dll) kecuali benar-benar dibutuhkan — cukup React state + react-query untuk server state
- Jangan duplikasi type/interface antara `apps/user` dan `apps/admin`
