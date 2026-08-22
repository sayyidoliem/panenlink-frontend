# PanenLink Functional Prototype

Next.js App Router prototype dengan peta OpenStreetMap, geocoding Photon/Nominatim, routing OSRM, pencarian muatan, profil, verifikasi, pengaturan, dark mode, i18n, bantuan, dan chatbot lokal.

## Run

```bash
npm install
npm run dev
```

Data demo dan preferensi disimpan di localStorage. API route `/api/geocode` dan `/api/route` menjadi adapter untuk layanan peta publik.

## Kode yang dihapus dari versi lama

`src/application`, `src/domain`, `src/infrastructure`, `src/presentation`, `src/main.tsx`, dan `src/vite-env.d.ts` adalah implementasi Vite/root-level duplikat. Gunakan `src/features/panenlink` sebagai sumber domain PanenLink.
