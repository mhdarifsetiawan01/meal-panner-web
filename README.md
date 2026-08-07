# MasakApa — Frontend Monorepo (`meal-planner-web`)

Frontend monorepo untuk aplikasi rekomendasi menu masak berbasis AI **"MasakApa"**. Proyek ini dikelola menggunakan **Turborepo** dan **pnpm workspaces**, berisi 2 aplikasi web Next.js dan shared packages.

---

## ⚡ Tech Stack

- **Monorepo Manager:** Turborepo + pnpm workspaces
- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Supabase JS Client (Google OAuth)

---

## 📂 Struktur Monorepo

```text
apps/
  user/                -> Web app untuk end-user (Port 3000)
  admin/               -> Dashboard admin panel (Port 3001)
packages/
  shared-types/        -> Single source of truth untuk TypeScript domain types
  supabase-client/     -> Config & helper Supabase authentication client
docs/
  API_CONTRACT.md      -> Referensi kontrak REST API backend Go
turbo.json             -> Konfigurasi pipeline Turborepo
pnpm-workspace.yaml    -> Konfigurasi workspace pnpm
```

---

## ⚙️ Setup & Environment Variables

### 1. Setup Environment Variables

Buat file `.env.local` di folder `apps/user` dan `apps/admin` (referensi file `.env.example` yang ada di masing-masing app):

**`apps/user/.env.local` & `apps/admin/.env.local`:**
```ini
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🚀 Cara Menjalankan (Local Development)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Jalankan Semua Apps (Dev Mode)

```bash
pnpm dev
```

Aplikasi akan berjalan di:
- **User App:** `http://localhost:3000`
- **Admin App:** `http://localhost:3001`

### 3. Build Semua Apps

```bash
pnpm build
```

### 4. Type Check

```bash
pnpm type-check
```

---

## 📦 Packages & Dependencies Management

- Untuk menambahkan dependency ke app tertentu (misal `apps/user`):
  ```bash
  pnpm --filter @masakapa/user add <package-name>
  ```
- Untuk menambahkan dependency ke seluruh workspace (root):
  ```bash
  pnpm add -w -D <package-name>
  ```
