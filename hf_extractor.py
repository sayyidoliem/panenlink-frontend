"""
hf_extractor.py
Root entrypoint wrapping llm-service/hf_extractor.py for direct script and solver execution.
"""
import os
import sys

# Ensure llm-service directory is in sys.path
llm_service_dir = os.path.join(os.path.dirname(__file__), "llm-service")
if os.path.exists(llm_service_dir) and llm_service_dir not in sys.path:
    sys.path.insert(0, llm_service_dir)

from hf_extractor import (
    MODEL_PATH,
    SYSTEM_PROMPT,
    extract_farmer_message,
    heuristic_fallback,
    load_model,
)

if __name__ == "__main__":
    import json
    sample_text = "Pak, cabe rawit merah siap panen besok subuh jam 5 kira2 ada 3 kuintal di Ciwidey ya."
    if len(sys.argv) > 1:
        sample_text = " ".join(sys.argv[1:])

    print("\n--- Input Message ---")
    print(sample_text)
    print("\n--- Extracted JSON Output for Solver ---")
    result = extract_farmer_message(sample_text)
    print(json.dumps(result, indent=2, ensure_ascii=False))
