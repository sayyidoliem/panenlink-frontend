"""
qwen-llm.py
Fine-tuning script for Qwen2.5-7B-Instruct on Indonesian agricultural
logistics extraction for PanenLink. Produces the GGUF model consumed by local_llm_service.py.

OUTPUT CONTRACT (must match FarmerExtraction in local_llm_service.py):
  {
    "commodity":         str           – e.g. "cabai rawit merah"
    "quantity_value":    float         – e.g. 3.0
    "quantity_unit":     str           – e.g. "kuintal"  (kg|kuintal|kwintal|ton|karung|peti|ikat)
    "ready_time_phrase": str           – e.g. "besok subuh jam 5"
    "location_name":     str | None    – e.g. "Ciwidey"
    "notes":             str | None    – e.g. "butuh pickup cepat"
  }
"""


from unsloth import FastLanguageModel
import torch
from datasets import Dataset
from trl import SFTTrainer
from transformers import TrainingArguments
import json


max_seq_length = 1024
dtype = None  # Auto detection
load_in_4bit = True


# 1. Load base Qwen2.5 model
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/Qwen2.5-7B-Instruct-bnb-4bit",
    max_seq_length=max_seq_length,
    dtype=dtype,
    load_in_4bit=load_in_4bit,
)


# 2. Add LoRA Adapters
model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    lora_alpha=16,
    lora_dropout=0,
    bias="none",
    use_gradient_checkpointing="unsloth",
)


# 3. Format Dataset into ChatML
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
}"""


synthetic_data = [
    {
        "input": "Pak, cabe rawit merah siap panen besok subuh jam 5 kira2 ada 3 kuintal di Ciwidey ya.",
        "output": json.dumps({
            "commodity": "cabai rawit merah",
            "quantity_value": 3.0,
            "quantity_unit": "kuintal",
            "ready_time_phrase": "besok subuh jam 5",
            "location_name": "Ciwidey",
            "notes": None
        })
    },
    {
        "input": "lapor min panen bamer ada 15 karung siap angkut lusa siang dr Tarogong Garut, butuh pickup cepat",
        "output": json.dumps({
            "commodity": "bawang merah",
            "quantity_value": 15.0,
            "quantity_unit": "karung",
            "ready_time_phrase": "lusa siang",
            "location_name": "Tarogong Garut",
            "notes": "butuh pickup cepat"
        })
    },
    {
        "input": "KOPERASI TANI MAKMUR JAYA\nSURAT JALAN / MANIFEST PANEN\nNo: 042/SJ/VIII/2026\nKomoditas: Kentang Granola Super\nJumlah: 2.5 Ton (50 Karung @ 50kg)\nLokasi Penjemputan: Gudang Desa Margamukti, Kec. Pangalengan\nJadwal Muat: 25 Agustus 2026 Pukul 08:00 WIB\nCatatan: Memerlukan truk tertutup / terpal anti-hujan",
        "output": json.dumps({
            "commodity": "kentang granola",
            "quantity_value": 2.5,
            "quantity_unit": "ton",
            "ready_time_phrase": "25 Agustus 2026 Pukul 08:00 WIB",
            "location_name": "Desa Margamukti, Kec. Pangalengan",
            "notes": "Koperasi Tani Makmur Jaya, butuh terpal anti-hujan"
        })
    },
    {
        "input": "Ada panen tomat 10 karung siap angkut besok siang di Lembang.",
        "output": json.dumps({
            "commodity": "tomat",
            "quantity_value": 10.0,
            "quantity_unit": "karung",
            "ready_time_phrase": "besok siang",
            "location_name": "Lembang",
            "notes": None
        })
    },
    {
        "input": "Bawang merah 500 kg, siap kirim minggu depan pagi dari Brebes.",
        "output": json.dumps({
            "commodity": "bawang merah",
            "quantity_value": 500.0,
            "quantity_unit": "kg",
            "ready_time_phrase": "minggu depan pagi",
            "location_name": "Brebes",
            "notes": None
        })
    },
]




def format_prompts(batch):
    texts = []
    for inp, out in zip(batch["input"], batch["output"]):
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": inp},
            {"role": "assistant", "content": out}
        ]
        texts.append(tokenizer.apply_chat_template(messages, tokenize=False))
    return {"text": texts}




dataset = Dataset.from_list(synthetic_data).map(format_prompts, batched=True)


# 4. Train Model
trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    dataset_text_field="text",
    max_seq_length=max_seq_length,
    dataset_num_proc=2,
    packing=False,
    args=TrainingArguments(
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        warmup_steps=5,
        max_steps=60,  # Fast training run for demo adaptation
        learning_rate=2e-4,
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        logging_steps=1,
        output_dir="outputs",
        report_to="none",  # Prevents prompting for a Weights & Biases API key
    ),
)
trainer.train()


# 5. Export to GGUF (for offline CPU/GPU deployment via local_llm_service.py)
# Exports to models/qwen_farmer_model-unsloth.Q4_K_M.gguf
model.save_pretrained_gguf("models/qwen_farmer_model", tokenizer, quantization_method="q4_k_m")
