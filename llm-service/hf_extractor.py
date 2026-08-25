"""
hf_extractor.py
Loads local fine-tuned Hugging Face model weights (safetensors) from ./local_model
or ./model-weights and extracts structured agricultural logistics data (JSON) for the VRPTW solver.
"""

import json
import os
import re
import sys
from typing import Any, Dict, Optional

# ---------------------------------------------------------------------------
# Model path resolution
# ---------------------------------------------------------------------------
MODEL_CANDIDATES = [
    os.environ.get("MODEL_PATH"),
    "./local_model",
    "../local_model",
    "./model-weights",
    "../model-weights",
    "models/weights",
]

def resolve_model_path() -> Optional[str]:
    for candidate in MODEL_CANDIDATES:
        if candidate and os.path.exists(candidate) and (
            os.path.exists(os.path.join(candidate, "config.json")) or
            os.path.exists(os.path.join(candidate, "model.safetensors.index.json"))
        ):
            return candidate
    for candidate in ["./local_model", "./model-weights", "../model-weights"]:
        if os.path.exists(candidate):
            return candidate
    return "./local_model"

MODEL_PATH = resolve_model_path()

SYSTEM_PROMPT = """You are an Indonesian agricultural logistics extractor. Output ONLY valid JSON matching this schema:
{
  "commodity": string,
  "quantity_value": number,
  "quantity_unit": string,
  "ready_time_phrase": string,
  "location_name": string
}"""

# Global references
tokenizer = None
model = None
_load_attempted = False


def load_model(path: Optional[str] = None):
    """Load tokenizer and model from local path."""
    global tokenizer, model, MODEL_PATH, _load_attempted
    _load_attempted = True
    target_path = path or MODEL_PATH or "./local_model"

    if not os.path.exists(target_path):
        print(f"[WARN] Model path '{target_path}' does not exist.")
        return None, None

    try:
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer

        print(f"[INFO] Loading HF model & tokenizer from '{target_path}'...")
        tokenizer = AutoTokenizer.from_pretrained(target_path, local_files_only=True)
        
        device_dtype = torch.float16 if torch.cuda.is_available() else torch.float32
        model = AutoModelForCausalLM.from_pretrained(
            target_path,
            torch_dtype=device_dtype,
            device_map="auto" if torch.cuda.is_available() else None,
            local_files_only=True
        )
        if not torch.cuda.is_available():
            model.to("cpu")
        model.eval()
        print("[INFO] Model loaded successfully!")
        return tokenizer, model
    except Exception as e:
        print(f"[WARN] Unable to load PyTorch/Transformers model from '{target_path}': {e}")
        return None, None


def extract_farmer_message(text: str) -> Dict[str, Any]:
    """
    Extracts structured fields from agricultural message text using the local HF model.
    Falls back gracefully if the model output is not valid JSON or if the model isn't loaded.
    """
    global tokenizer, model, _load_attempted

    if not _load_attempted and (model is None or tokenizer is None):
        try:
            load_model()
        except Exception as e:
            print(f"[WARN] Lazy model loading error: {e}")

    if model is not None and tokenizer is not None:
        try:
            import torch
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": text}
            ]
            prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
            inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

            with torch.no_grad():
                outputs = model.generate(
                    **inputs,
                    max_new_tokens=256,
                    temperature=0.1,
                    do_sample=False,
                    pad_token_id=tokenizer.eos_token_id or tokenizer.pad_token_id
                )

            response_text = tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True).strip()
            clean_json = re.sub(r"^```json\s*|\s*```$", "", response_text, flags=re.MULTILINE).strip()
            
            # Extract JSON substring if wrapped with text
            json_match = re.search(r"\{.*\}", clean_json, flags=re.DOTALL)
            if json_match:
                clean_json = json_match.group(0)

            parsed = json.loads(clean_json)
            # Ensure required keys exist
            required_keys = ["commodity", "quantity_value", "quantity_unit", "ready_time_phrase"]
            if all(k in parsed for k in required_keys):
                return parsed
        except Exception as e:
            print(f"[WARN] Model inference error: {e}. Using fallback.")

    # Fallback jika model offline atau output belum sempurna
    return heuristic_fallback(text)


def heuristic_fallback(text: str) -> Dict[str, Any]:
    """Robust regex heuristic fallback to ensure solver always receives valid JSON."""
    lower = text.lower()

    # Commodity
    commodity = "hortikultura"
    if re.search(r"cabe\s+rawit\s+merah|cabai\s+rawit\s+merah", lower):
        commodity = "cabai rawit merah"
    elif re.search(r"cabe\s+rawit|cabai\s+rawit|lombok", lower):
        commodity = "cabai rawit"
    elif re.search(r"cabe|cabai", lower):
        commodity = "cabai"
    elif re.search(r"bamer|bawang\s+merah", lower):
        commodity = "bawang merah"
    elif re.search(r"baput|bawang\s+putih", lower):
        commodity = "bawang putih"
    elif re.search(r"tomat", lower):
        commodity = "tomat"
    elif re.search(r"kentang", lower):
        commodity = "kentang granola"
    elif re.search(r"jagung", lower):
        commodity = "jagung"

    # Quantity & unit
    qty = 100.0
    unit = "kg"
    qty_match = re.search(r"(\d+(?:[.,]\d+)?)\s*(kg|kilo|kilogram|kuintal|kwintal|ton|karung|peti|ikat|sak)", lower)
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

    # Time phrase
    ready_time = "besok pagi"
    time_match = re.search(
        r"((?:besok|lusa|nanti|hari\s+ini)\s+(?:subuh|pagi|siang|sore|malam)(?:\s+jam\s*\d+)?|\d{1,2}\s+[A-Za-z]+\s+\d{4}(?:\s+pukul\s*[\d:.]+\s*WIB)?|jam\s*\d{1,2}(?::\d{2})?(?:\s*wib)?)",
        lower
    )
    if time_match:
        ready_time = time_match.group(1).strip()

    # Location
    location = "Ciwidey"
    loc_match = re.search(r"(?:di|dr|dari|lokasi)\s+([A-Z][a-zA-Z0-9\s.,-]+?)(?:,|\.|\s+ya|\s+butuh|\s+siap|\s+tolong|$)", text)
    if loc_match:
        cand = loc_match.group(1).strip()
        if len(cand) > 2 and not any(w in cand.lower() for w in ["besok", "lusa", "pagi", "siang"]):
            location = cand

    return {
        "commodity": commodity,
        "quantity_value": qty,
        "quantity_unit": unit,
        "ready_time_phrase": ready_time,
        "location_name": location
    }


if __name__ == "__main__":
    sample_text = "Pak, cabe rawit merah siap panen besok subuh jam 5 kira2 ada 3 kuintal di Ciwidey ya."
    if len(sys.argv) > 1:
        sample_text = " ".join(sys.argv[1:])

    print("\n--- Input Message ---")
    print(sample_text)
    print("\n--- Extracted JSON Output for Solver ---")
    result = extract_farmer_message(sample_text)
    print(json.dumps(result, indent=2, ensure_ascii=False))
