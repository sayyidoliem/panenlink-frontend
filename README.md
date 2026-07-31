# PanenLink Frontend

Frontend MVP tiga role: Petani, Pengemudi, dan Operator. Data tersimpan di localStorage dan siap diganti ke API AI/ML melalui repository.

## Menjalankan
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

Gunakan role switcher di sidebar untuk demonstrasi. Semua form, status, match, penerimaan trip, kalkulasi, notifikasi, ekspor JSON, dan reset demo berfungsi.

## Integrasi API
Ubah `VITE_USE_MOCK=false`, isi `VITE_API_BASE_URL`, lalu implementasikan endpoint pada `src/infrastructure/repositories/HttpPanenLinkRepository.ts` sesuai kontrak `PanenLinkRepository`.
