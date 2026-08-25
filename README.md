# PanenLink Frontend & AI Services

This repository contains the Next.js App Router frontend for PanenLink, an agricultural logistics platform in Indonesia. It features interactive OpenStreetMap routing, geocoding, dark mode, load matching, and a local AI assistant powered by a fine-tuned Qwen 2.5 7B model.

## 🏗️ Project Architecture

This project consists of two main parts:
1. **Next.js Frontend & API Routes** (Node.js) - Handles the UI, Map rendering, and proxies requests.
2. **Local LLM Service** (Python FastAPI) - A lightweight backend running the local GGUF model for the AI Chatbot (`/ai`) and smart load extraction (`/post-load`).

---

## 🚀 Getting Started

### 1. Environment Setup

Create a `.env` file in the root directory (you can copy from `.env.example`). At minimum, ensure these URLs are set:

```env
# The main remote backend for VRPTW load matching
NEXT_PUBLIC_PANENLINK_API_URL="https://panenlink-backend.onrender.com"

# The local Python LLM service
LLM_SERVICE_URL="http://localhost:8000"

# Optional: Add your Supabase & Firebase keys if working on auth/storage features
```

*(Note: For production deployments like Vercel, set `LLM_SERVICE_URL` in the Vercel dashboard to point to your hosted Python service.)*

---

### 2. Running the Next.js Frontend

The frontend uses standard Next.js (Turbopack recommended):

## 📦 Supabase Implementation Pack
Paket ini tidak mengubah JSX, class CSS, section, ikon, atau layout UI. Isinya adalah fondasi database dan repository yang mengganti data demo/localStorage secara bertahap.

### Jalankan migration
Salin `supabase/migrations/20260825_panenlink_integration.sql` ke Supabase SQL Editor, atau gunakan Supabase CLI.
The app will start on `http://localhost:3000`. 
*(Note: Ensure you don't have nested duplicate folders like `panenlink-frontend/panenlink-frontend` causing build issues. The `tsconfig.json` has been configured to exclude them if present).*

---

### 3. Setting up the Local AI Backend (LLM Service)

To use the AI chatbot and smart data extraction, you must run the local Python service. 

**Prerequisites:**
You need Python 3.9+ installed on your machine.

**Install Dependencies:**
```bash
cd llm-service
pip3 install fastapi uvicorn pydantic llama_cpp_python huggingface_hub
```

**Download the Fine-Tuned Model:**
The service requires our team's specific fine-tuned model (`pasya-llm` branch) in `.gguf` format (~4.4 GB). You can download it directly from Hugging Face into the `models` folder using Python:

```bash
# From the root directory:
python3 -c "
from huggingface_hub import hf_hub_download
hf_hub_download(
    repo_id='Pkhswell/panenlink-qwen2-7b-finetuned',
    filename='gguf/Qwen2.5-7B-Instruct.Q4_K_M.gguf',
    revision='pasya-llm',
    local_dir='models'
)
"
```

Create a symlink so the python service can find the model:
```bash
mkdir -p llm-service/models
ln -sf $(pwd)/models/gguf/Qwen2.5-7B-Instruct.Q4_K_M.gguf llm-service/models/Qwen2.5-7B-Instruct.Q4_K_M.gguf
```

**Run the Service:**
```bash
cd llm-service
python3 local_llm_service.py
```
The FastAPI service will start on `http://localhost:8000`.

---

## 🗺️ VRPTW Load Optimization API

The `loads/page.tsx` includes an **Optimasi Rute AI** button that integrates with the main Render backend (`/api/match`). This sends agricultural nodes, available trucks, and a distance matrix to the server, returning optimized route assignments for the vehicles.

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
