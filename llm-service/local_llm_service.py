"""
local_llm_service.py
FastAPI service wrapping the local GGUF Qwen model.
Exposes two endpoints consumed by the PanenLink Next.js frontend:
  POST /chat    -> { reply: str }                  (AI page chatbot)
  POST /extract -> FarmerExtraction JSON object    (post-load autofill)
"""

import glob
import json
import os
import re
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from llama_cpp import Llama


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------


class FarmerExtraction(BaseModel):
    """Structured fields extracted from agricultural messages or documents for VRPTW optimization."""
    commodity: str = Field(..., description="Normalized Indonesian agricultural commodity")
    quantity_value: float = Field(..., description="Numeric quantity")
    quantity_unit: str = Field(..., description="Measurement unit (kg, kuintal, ton, karung, peti, ikat, etc.)")
    ready_time_phrase: str = Field(..., description="Preserved relative or stated time phrase")
    location_name: str | None = Field(default=None, description="Village, sub-district, district, or regency name")
    notes: str | None = Field(default=None, description="Transport notes, cooperative name, or key metadata")


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    """Shape consumed by the frontend /ai page."""
    reply: str


class ExtractRequest(BaseModel):
    message: str


# ---------------------------------------------------------------------------
# Model loading (once at startup)
# ---------------------------------------------------------------------------

llm: Llama | None = None

MODEL_CANDIDATES = [
    "models/qwen_farmer_model-unsloth.Q4_K_M.gguf",
    "models/Qwen2.5-7B-Instruct.Q4_K_M.gguf",
    "qwen_farmer_model-unsloth.Q4_K_M.gguf",
    "Qwen2.5-7B-Instruct.Q4_K_M.gguf",
]

def resolve_model_path() -> str | None:
    for candidate in MODEL_CANDIDATES:
        if os.path.exists(candidate):
            return candidate
    found = glob.glob("models/*.gguf") + glob.glob("*.gguf")
    return found[0] if found else None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global llm
    model_path = resolve_model_path()
    if model_path:
        print(f"[INFO] Loading GGUF model from '{model_path}'...")
        llm = Llama(
            model_path=model_path,
            n_ctx=2048,    # Qwen2.5-7B needs ≥2048 for coherent multi-turn answers
            n_threads=4,   # tune to host CPU cores
            verbose=False,
        )
        print("[INFO] Model loaded successfully!")
    else:
        print(f"[WARNING] GGUF model file not found in 'models/' or root directory.")
        print(f"[WARNING] Place a .gguf model in 'models/' or run 'python qwen-llm.py'.")
    yield
    llm = None  # release on shutdown


# ---------------------------------------------------------------------------
# Shared prompt configuration
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are an expert AI Data Extraction and Logistics Assistant for the PanenLink platform.
Your mission is to analyze unstructured Indonesian agricultural messages (from WhatsApp chats, voice-to-text transcripts, or extracted document texts like PDF manifest slips) and convert them into a strictly formatted JSON object for downstream Vehicle Routing Problem (VRPTW) optimization.

### EXTRACTION GUIDELINES:
1. OUTPUT FORMAT: Respond ONLY with a single, valid JSON object matching the schema below. Do not include markdown code fence headers (```json), commentary, or extra text.
2. COMMODITY NORMALIZATION: Normalize commodity names into standard Indonesian terms (e.g., convert "cabe rawit / lombok" -> "cabai rawit", "bamer" -> "bawang merah", "baput" -> "bawang putih", "tomat sayur" -> "tomat").
3. QUANTITY & UNITS: Extract the explicit numeric quantity and the original measurement unit ("kg", "kuintal", "kwintal", "ton", "karung", "peti", "ikat").
4. TIME WINDOW: Preserve the exact relative or stated time phrase (e.g., "besok subuh jam 5", "lusa siang", "nanti sore").
5. LOCATION: Extract the village, sub-district, district, or regency name. If missing or completely ambiguous, return null.
6. DOCUMENT/PDF HANDLING: If the input text originates from an invoice, manifest, or official agricultural letter, extract the primary shipment commodity, total net weight, pickup location/origin, and scheduled departure/readiness date. Include key metadata (such as cooperative/farmer group name or transport notes) under the "notes" field.

### JSON SCHEMA:
{
  "commodity": "string",
  "quantity_value": number,
  "quantity_unit": "string",
  "ready_time_phrase": "string",
  "location_name": "string or null",
  "notes": "string or null"
}

### FEW-SHOT EXAMPLES:

--- Example 1: Informal WhatsApp Text ---
User:
"Pak, cabe rawit merah siap panen besok subuh jam 5 kira2 ada 3 kuintal di Ciwidey ya."

Assistant:
{
  "commodity": "cabai rawit merah",
  "quantity_value": 3.0,
  "quantity_unit": "kuintal",
  "ready_time_phrase": "besok subuh jam 5",
  "location_name": "Ciwidey",
  "notes": null
}

--- Example 2: Voice-to-Text / Chat with Dialect & Sacks ---
User:
"lapor min panen bamer ada 15 karung siap angkut lusa siang dr Tarogong Garut, butuh pickup cepat"

Assistant:
{
  "commodity": "bawang merah",
  "quantity_value": 15.0,
  "quantity_unit": "karung",
  "ready_time_phrase": "lusa siang",
  "location_name": "Tarogong Garut",
  "notes": "butuh pickup cepat"
}

--- Example 3: Extracted Text from PDF Manifest / Surat Jalan ---
User:
"KOPERASI TANI MAKMUR JAYA
SURAT JALAN / MANIFEST PANEN
No: 042/SJ/VIII/2026
Komoditas: Kentang Granola Super
Jumlah: 2.5 Ton (50 Karung @ 50kg)
Lokasi Penjemputan: Gudang Desa Margamukti, Kec. Pangalengan
Jadwal Muat: 25 Agustus 2026 Pukul 08:00 WIB
Catatan: Memerlukan truk tertutup / terpal anti-hujan"

Assistant:
{
  "commodity": "kentang granola",
  "quantity_value": 2.5,
  "quantity_unit": "ton",
  "ready_time_phrase": "25 Agustus 2026 Pukul 08:00 WIB",
  "location_name": "Desa Margamukti, Kec. Pangalengan",
  "notes": "Koperasi Tani Makmur Jaya, butuh terpal anti-hujan"
}"""


CHAT_SYSTEM_PROMPT = (
    "Kamu adalah Asisten PanenLink, asisten AI untuk platform logistik pertanian Indonesia. "
    "Jawab dengan singkat (maksimal 3 kalimat), ramah, dan HANYA dalam Bahasa Indonesia. "
    "JANGAN gunakan Bahasa Inggris. "
    "Topik yang dapat kamu bantu: cara memasang muatan, ekstraksi data panen/manifest, "
    "menghubungi driver, verifikasi dokumen, penggunaan peta, rute logistik VRPTW, dan pengaturan PanenLink."
)


def _call_llm(system: str, user: str, max_tokens: int = 512) -> str:
    """Build a ChatML prompt and call the local model."""
    prompt = (
        f"<|im_start|>system\n{system}<|im_end|>\n"
        f"<|im_start|>user\n{user}<|im_end|>\n"
        f"<|im_start|>assistant\n"
    )
    output = llm(prompt, max_tokens=max_tokens, stop=["<|im_end|>"], temperature=0.1)
    return output["choices"][0]["text"].strip()


# ---------------------------------------------------------------------------
# Deterministic regex & heuristic fallback for /extract
# ---------------------------------------------------------------------------


def _regex_extract(text: str) -> FarmerExtraction:
    text_lower = text.lower()

    # 1. Commodity Normalization
    commodity = "hortikultura"
    commodity_mappings = [
        (r'\b(?:cabe|cabai)\s+rawit\s+merah\b', "cabai rawit merah"),
        (r'\b(?:cabe|cabai)\s+rawit\b|\blombok\b', "cabai rawit"),
        (r'\b(?:cabe|cabai)\s+(?:merah\s+)?keriting\b', "cabai merah keriting"),
        (r'\b(?:cabe|cabai)\s+merah\b', "cabai merah"),
        (r'\b(?:cabe|cabai)\b', "cabai"),
        (r'\bbamer\b|\bbawang\s+merah\b', "bawang merah"),
        (r'\bbaput\b|\bbawang\s+putih\b', "bawang putih"),
        (r'\bbawang\s+daun\b|\bdaun\s+bawang\b', "daun bawang"),
        (r'\btomat\s+sayur\b|\btomat\s+ceri\b|\btomat\b', "tomat"),
        (r'\bkentang\s+granola(?:\s+super)?\b', "kentang granola"),
        (r'\bkentang\b', "kentang"),
        (r'\bjagung\s+manis\b|\bjagung\b', "jagung"),
        (r'\bsingkong\b|\bubi\b', "singkong"),
        (r'\bwortel\b', "wortel"),
        (r'\bkubis\b|\bkol\b', "kubis"),
        (r'\bbuncis\b', "buncis"),
        (r'\bsawi\b|\bcaisim\b', "sawi"),
        (r'\bterong\b', "terong"),
    ]
    for pattern, name in commodity_mappings:
        if re.search(pattern, text_lower):
            commodity = name
            break

    # 2. Quantity & Unit
    qty = 1.0
    unit = "kg"
    qty_match = re.search(
        r'(\d+(?:[.,]\d+)?)\s*(kg|kilo|kilogram|kuintal|kwintal|ton|karung|peti|ikat|box|sak)',
        text_lower,
    )
    if qty_match:
        qty = float(qty_match.group(1).replace(",", "."))
        u = qty_match.group(2)
        if u in ("kilo", "kilogram"):
            unit = "kg"
        elif u == "kwintal":
            unit = "kuintal"
        elif u == "sak":
            unit = "karung"
        else:
            unit = u

    # 3. Ready Time Phrase
    ready_time = "segera"
    # Check for manifest schedule
    sched_match = re.search(r'jadwal\s*(?:muat|kirim|angkut)?\s*:\s*([^\n\r,]+)', text, re.IGNORECASE)
    if sched_match:
        ready_time = sched_match.group(1).strip()
    else:
        time_match = re.search(
            r'((?:besok|lusa|nanti|hari\s+ini)\s+(?:subuh|pagi|siang|sore|malam)(?:\s+jam\s*\d+)?|\d{1,2}\s+[A-Za-z]+\s+\d{4}(?:\s+pukul\s*[\d:.]+\s*WIB)?|jam\s*\d{1,2}(?::\d{2})?(?:\s*wib)?)',
            text_lower,
        )
        if time_match:
            ready_time = time_match.group(1).strip()

    # 4. Location Extraction
    location_name: str | None = None
    loc_manifest = re.search(r'lokasi\s*(?:penjemputan|muat|asal|ambil)?\s*:\s*([^\n\r]+)', text, re.IGNORECASE)
    if loc_manifest:
        location_name = loc_manifest.group(1).strip().replace("Gudang ", "")
    else:
        loc_chat = re.search(r'(?:di|dr|dari|lokasi)\s+([A-Z][a-zA-Z0-9\s.,-]+?)(?:,|\.|\s+ya|\s+butuh|\s+siap|\s+tolong|$)', text)
        if loc_chat:
            loc_val = loc_chat.group(1).strip()
            if len(loc_val) > 2 and not any(w in loc_val.lower() for w in ["besok", "lusa", "pagi", "siang"]):
                location_name = loc_val

    # 5. Notes Extraction
    notes: str | None = None
    notes_list = []
    # Manifest header / cooperative name
    coop_match = re.search(r'(koperasi\s+[^\n\r]+|kelompok\s+tani\s+[^\n\r]+|pt\s+[^\n\r]+)', text, re.IGNORECASE)
    if coop_match:
        notes_list.append(coop_match.group(1).strip().title())

    # Manifest notes field
    cat_match = re.search(r'catatan\s*:\s*([^\n\r]+)', text, re.IGNORECASE)
    if cat_match:
        notes_list.append(cat_match.group(1).strip())

    # Informal chat special requests
    req_match = re.search(r'\b(butuh\s+[^\n\r,.]+|perlu\s+[^\n\r,.]+|terpal\s+[^\n\r,.]+|truk\s+[^\n\r,.]+)', text_lower)
    if req_match and not cat_match:
        notes_list.append(req_match.group(1).strip())

    if notes_list:
        notes = ", ".join(notes_list)

    return FarmerExtraction(
        commodity=commodity,
        quantity_value=qty,
        quantity_unit=unit,
        ready_time_phrase=ready_time,
        location_name=location_name,
        notes=notes,
    )


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------


app = FastAPI(
    title="PanenLink Local LLM Service",
    version="1.0.0",
    lifespan=lifespan,
)


# Allow the Next.js dev server (port 3000) and prod origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://panenlink.app"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)


@app.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest) -> ChatResponse:
    """Chatbot endpoint for the /ai page."""
    if llm is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    reply = _call_llm(CHAT_SYSTEM_PROMPT, body.message, max_tokens=250)
    return ChatResponse(reply=reply)


@app.post("/extract", response_model=FarmerExtraction)
async def extract(body: ExtractRequest) -> FarmerExtraction:
    """
    Structured extraction endpoint for post-load autofill and logistics VRPTW.
    Cleans markdown wrappers and parses JSON strictly adhering to schema.
    Falls back to regex heuristics if model is not loaded or output isn't valid JSON.
    """
    if llm is not None:
        try:
            raw = _call_llm(SYSTEM_PROMPT, body.message, max_tokens=350)
            # Clean possible markdown formatting
            clean_raw = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.IGNORECASE)
            clean_raw = re.sub(r"\s*```$", "", clean_raw).strip()
            json_match = re.search(r"\{.*\}", clean_raw, flags=re.DOTALL)
            if json_match:
                clean_raw = json_match.group(0)
            data = json.loads(clean_raw)
            return FarmerExtraction(**data)
        except Exception as e:
            print(f"[WARN] LLM extraction JSON parse failed: {e}. Falling back to regex.")

    # Deterministic regex fallback
    return _regex_extract(body.message)




# ---------------------------------------------------------------------------
# Dev entrypoint
# ---------------------------------------------------------------------------


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("local_llm_service:app", host="0.0.0.0", port=8000, reload=True)
