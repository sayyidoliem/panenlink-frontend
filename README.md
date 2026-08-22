# PanenLink UI Prototype

Next.js App Router UI prototype berdasarkan kumpulan referensi HTML PanenLink. Fokus saat ini adalah visual dan navigasi, belum integrasi bisnis/API.

## Routes

- `/` landing page
- `/login`, `/register`
- `/dashboard`
- `/post-load`
- `/loads`, `/loads/empty`, `/loads/LOAD-2026-0821`
- `/orders`
- `/profile`
- `/settings`

## Run

```bash
npm install
npm run dev
```

## Architecture

Shared layout berada di `src/components/layout`, komponen UI di `src/components/ui`, dan setiap layar menggunakan route App Router terpisah. Sidebar menggunakan `usePathname` untuk active state. Semua form/tombol masih bersifat presentasional.
