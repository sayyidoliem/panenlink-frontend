"""
main.py
PanenLink Unified FastAPI Backend:
- LLM Service: /chat & /extract endpoints for Next.js frontend & VRPTW optimization
- WhatsApp Cloud API Webhook: /webhook/whatsapp (Auto-extraction & reply to farmers)
- Direct WhatsApp sender: /api/send-whatsapp
"""

import json
import os
import sys
from typing import Any, Dict, Optional

import requests
from fastapi import FastAPI, HTTPException, Query, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure local imports work whether run from root or subdirectory
current_dir = os.path.dirname(os.path.abspath(__file__))
llm_service_dir = os.path.join(current_dir, "llm-service")
for d in [current_dir, llm_service_dir]:
    if os.path.exists(d) and d not in sys.path:
        sys.path.insert(0, d)

from hf_extractor import extract_farmer_message

# ---------------------------------------------------------------------------
# Configuration & Credentials (via Environment Variables with Fallbacks)
# ---------------------------------------------------------------------------
VERIFY_TOKEN = os.environ.get("WHATSAPP_VERIFY_TOKEN", "PANENLINK_SECRET_TOKEN_123")
WHATSAPP_TOKEN = os.environ.get(
    "WHATSAPP_TOKEN",
    "EAAj7uxk4gcUBSQJhbYW2PbWakdsxkL93OfdhZC22jmsMZCLX50kpjAxY8ZCbWf9r3g5FBBTtJ5fUdvD5JYgCJoVVLZA4VfNKnyVBAcdvLpcZCvL7QBZCcpn2ZACfoytsU3OqdYs11oRpEYX8LHEfhzXgVFKZCk3VQdN3cZC925rRCrcBVEpPlZBhhF6jMaruPl82NGyovPyxljG5ibVv103KiGA0dAFNJCHrLlCQLRABsRlhOoV8dDZBFZAJWxeo7y99pS4dIHAuYQHsnzYhh01FpM0XyMCc"
)
PHONE_NUMBER_ID = os.environ.get("PHONE_NUMBER_ID", "106540645665809") # Replace with your Meta Phone Number ID
HF_TOKEN = os.environ.get("HF_TOKEN", "")
GRAPH_API_VERSION = os.environ.get("GRAPH_API_VERSION", "v19.0")

app = FastAPI(
    title="PanenLink AI & WhatsApp Webhook API",
    description="Automated agricultural logistics data extraction and WhatsApp Cloud API integration for PanenLink.",
    version="1.0.0"
)

# Allow Next.js frontend (local dev & production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://panenlink.app", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Pydantic Request & Response Models
# ---------------------------------------------------------------------------
class ExtractRequest(BaseModel):
    message: str


class FarmerExtractionResponse(BaseModel):
    commodity: str = Field(..., description="Normalized Indonesian agricultural commodity")
    quantity_value: float = Field(..., description="Numeric quantity")
    quantity_unit: str = Field(..., description="Measurement unit (kg, kuintal, ton, karung, peti, ikat, etc.)")
    ready_time_phrase: str = Field(..., description="Preserved relative or stated time phrase")
    location_name: Optional[str] = Field(default=None, description="Village, sub-district, district, or regency name")
    notes: Optional[str] = Field(default=None, description="Additional notes or metadata")


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


class SendWhatsAppRequest(BaseModel):
    to_phone: str
    message: str


# ---------------------------------------------------------------------------
# WhatsApp Utility Functions
# ---------------------------------------------------------------------------
def send_reply(to_phone: str, message: str) -> Dict[str, Any]:
    """Sends a text reply via Meta WhatsApp Cloud API."""
    url = f"https://graph.facebook.com/{GRAPH_API_VERSION}/{PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to_phone,
        "type": "text",
        "text": {"body": message}
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        resp_json = response.json()
        print(f"[WhatsApp API Response]: {response.status_code} - {resp_json}")
        return resp_json
    except Exception as e:
        print(f"[ERROR] Failed to send WhatsApp message to {to_phone}: {e}")
        return {"error": str(e)}


# ---------------------------------------------------------------------------
# 1. WhatsApp Webhook Endpoints
# ---------------------------------------------------------------------------
@app.get("/webhook/whatsapp", summary="Meta Webhook Verification")
def verify_whatsapp_webhook(
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token")
):
    """
    Endpoint for Meta WhatsApp Cloud API verification handshake.
    Configure this URL in Meta App Dashboard -> WhatsApp -> Configuration -> Callback URL.
    """
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        print(f"[INFO] WhatsApp Webhook verified successfully with challenge: {hub_challenge}")
        return Response(content=hub_challenge, media_type="text/plain")
    
    print(f"[WARN] WhatsApp Webhook verification failed. Received token: '{hub_verify_token}', Expected: '{VERIFY_TOKEN}'")
    return Response(content="Verification Failed", status_code=status.HTTP_403_FORBIDDEN)


@app.post("/webhook/whatsapp", summary="Receive WhatsApp Inbound Messages")
async def receive_whatsapp_message(request: Request):
    """
    Receives incoming WhatsApp messages from farmers, extracts harvest details with local HF model,
    and replies with structured confirmation.
    """
    try:
        data = await request.json()
        print(f"\n[INCOMING WHATSAPP PAYLOAD]: {json.dumps(data, indent=2)}")

        entry = data.get("entry", [])[0]
        changes = entry.get("changes", [])[0]
        value = changes.get("value", {})

        if "messages" in value and len(value["messages"]) > 0:
            msg = value["messages"][0]
            sender_phone = msg.get("from")
            msg_type = msg.get("type")

            if msg_type == "text":
                user_text = msg.get("text", {}).get("body", "")
                print(f"[WhatsApp Message from {sender_phone}]: {user_text}")

                # 1. Ekstraksi dengan model Hugging Face lokal
                parsed = extract_farmer_message(user_text)
                print(f"[Extracted Data]: {parsed}")

                # 2. Buat format balasan otomatis ramah petani
                commodity = parsed.get("commodity", "-").title()
                quantity = f"{parsed.get('quantity_value', 0)} {parsed.get('quantity_unit', 'kg')}"
                location = parsed.get("location_name") or "Akan dikonfirmasi"
                schedule = parsed.get("ready_time_phrase", "-")

                reply = (
                    f"🌾 *PanenLink Logistics Assistant*\n"
                    f"────────────────────────\n"
                    f"✅ *Panen Terdata Otomatis:*\n"
                    f"• *Komoditas:* {commodity}\n"
                    f"• *Jumlah:* {quantity}\n"
                    f"• *Lokasi Jemput:* {location}\n"
                    f"• *Jadwal Muat:* {schedule}\n"
                    f"────────────────────────\n"
                    f"Pesanan Anda telah dimasukkan ke dalam sistem optimasi rute logistik VRPTW PanenLink! 🚛💨"
                )

                # 3. Kirim respon balik ke WhatsApp
                send_reply(sender_phone, reply)
            else:
                # Handle non-text messages (e.g. image/voice/document)
                reply = (
                    "🌾 *PanenLink Logistics Assistant*\n"
                    "Terima kasih telah menghubungi PanenLink. Mohon kirimkan pesan teks mengenai komoditas, jumlah panen, dan lokasi penjemputan Anda."
                )
                send_reply(sender_phone, reply)

    except Exception as e:
        print(f"[ERROR] Error processing webhook payload: {e}")

    return {"status": "ok"}


# ---------------------------------------------------------------------------
# 2. Frontend / Direct AI Endpoints
# ---------------------------------------------------------------------------
@app.post("/extract", response_model=FarmerExtractionResponse, summary="Extract Farmer Message (JSON)")
async def api_extract(body: ExtractRequest):
    """
    Extracts structured agricultural logistics fields from unstructured text.
    Consumed by the PanenLink frontend (/post-load and /ai page) and VRPTW solvers.
    """
    result = extract_farmer_message(body.message)
    return FarmerExtractionResponse(**result)


@app.post("/chat", response_model=ChatResponse, summary="AI Assistant Chatbot")
async def api_chat(body: ChatRequest):
    """Chatbot assistance endpoint for the PanenLink /ai page."""
    lower = body.message.lower()
    if any(k in lower for k in ["muatan", "panen", "pasang"]):
        reply = "Untuk memasang muatan, Anda dapat mengetik pesan atau menempel teks surat jalan/manifest di menu Pasang Muatan untuk ekstraksi otomatis."
    elif any(k in lower for k in ["rute", "vrptw", "logistik", "sopir", "driver"]):
        reply = "Sistem logistik PanenLink mengelompokkan muatan petani dengan optimasi VRPTW berdasarkan jendela waktu muat armada terdekat."
    elif any(k in lower for k in ["peta", "lokasi", "jemput"]):
        reply = "Peta PanenLink mendukung penentuan titik penjemputan di berbagai sentra pertanian dan gudang sentra Jawa Barat."
    else:
        reply = "Halo! Saya Asisten AI PanenLink. Saya dapat membantu ekstraksi data muatan panen serta informasi operasional dan rute armada."
    return ChatResponse(reply=reply)


@app.post("/api/send-whatsapp", summary="Send Outbound WhatsApp Message")
async def api_send_whatsapp(body: SendWhatsAppRequest):
    """Manually send an outbound message to a driver or farmer via WhatsApp Cloud API."""
    res = send_reply(body.to_phone, body.message)
    return {"status": "sent", "response": res}


@app.get("/health", summary="Health Check")
def health_check():
    return {
        "status": "healthy",
        "service": "PanenLink AI & WhatsApp Webhook API",
        "verify_token_configured": bool(VERIFY_TOKEN),
        "phone_number_id": PHONE_NUMBER_ID
    }


# ---------------------------------------------------------------------------
# CLI Entrypoint
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting PanenLink API on http://0.0.0.0:{port}...")
    print(f"WhatsApp Webhook Verification URL: http://0.0.0.0:{port}/webhook/whatsapp")
    print(f"Verify Token: {VERIFY_TOKEN}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
