# PanenLink Supabase Implementation Pack

Paket ini tidak mengubah JSX, class CSS, section, ikon, atau layout UI. Isinya adalah fondasi database dan repository yang mengganti data demo/localStorage secara bertahap.

## 1. Jalankan migration

Salin `supabase/migrations/20260825_panenlink_integration.sql` ke Supabase SQL Editor, atau gunakan Supabase CLI.

Migration menyediakan:

- provisioning `profiles`, `user_settings`, dan empat dokumen verifikasi
- backfill aman untuk pengguna lama
- trigger `updated_at`
- unique index penting
- RLS seluruh tabel aplikasi
- bucket dan policy Storage
- fungsi agregat profil

> Tinjau policy `shipments` sesuai aturan bisnis. Client biasa tidak diberi policy INSERT shipment karena assignment driver sebaiknya dilakukan melalui backend/admin workflow.

## 2. Salin modul TypeScript

Salin folder `src/shared/lib` dari paket ini ke proyek. File baru tidak mengganti UI.

## 3. Integrasi halaman tanpa perubahan UI

- `/post-load`: ganti localStorage pada `submit` dengan `createLoad(...)`.
- `/loads`: isi state `all` dari `listOpenLoads()` pada `useEffect`.
- `/loads/[id]`: ambil `getLoad(params.id)` dan gunakan nilai database pada node JSX yang sama.
- `/orders`: isi shipment aktif dan history dari `listMyShipments()`, lalu gunakan `addShipmentEvent()` pada tombol status.
- `AppProvider`: jadikan `user_settings` dan `alerts` sumber utama. Jangan simpan `security.pin`, alerts, account, atau notification settings ke localStorage.
- `/dashboard`: ambil loads/shipments/alerts/dashboard_notes dengan user aktif; pertahankan semua card yang ada.
- `/ai`: satu conversation aktif per halaman, load `ai_messages`, insert pesan user/bot, delete conversation ketika tombol Trash ditekan.
- `/settings`: CRUD `bank_accounts`; update `user_settings`; password melalui `supabase.auth.updateUser`.

## 4. Perbaikan keamanan wajib

- Hapus nilai PIN default `123456`.
- Jangan menyimpan PIN plaintext di React state atau localStorage.
- Hash PIN hanya melalui Route Handler server atau RPC yang tervalidasi.
- Bucket `verification-documents` harus tetap privat.
- Jangan pernah menggunakan service-role key pada client.
- `.env.local` jangan di-commit.

## 5. Catatan query shipment

PostgREST `.or()` lintas embedded relation dapat dibatasi tergantung versi. Jika query `listMyShipments()` ditolak, buat dua query paralel: shipment sebagai driver, dan shipment berdasarkan ID load milik user, lalu gabungkan berdasarkan `shipment.id`.
