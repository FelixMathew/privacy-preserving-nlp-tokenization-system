from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import uuid
import re
import io
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ── In-memory token vault ─────────────────────────────────────────
token_vault: dict[str, dict] = {}

# ── In-memory activity log ────────────────────────────────────────
activity_log: list[dict] = []


def log_event(action: str, detail: str, event_type: str = "info"):
    """Record an event in the activity log."""
    activity_log.insert(0, {
        "time": datetime.now().strftime("%H:%M:%S"),
        "action": action,
        "detail": detail,
        "type": event_type  # upload, scan, tokenize, detokenize, export, verify
    })


# ── Regex patterns for PII detection ──────────────────────────────
EMAIL_RE   = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$')
PHONE_RE   = re.compile(r'^[\+]?[\d\s\-\(\)]{7,15}$')
SSN_RE     = re.compile(r'^\d{3}-\d{2}-\d{4}$')
CARD_RE    = re.compile(r'^\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}$')

SENSITIVE_NAME_HINTS = {
    'email': ['email', 'e-mail', 'mail'],
    'phone': ['phone', 'tel', 'mobile', 'cell', 'fax'],
    'ssn':   ['ssn', 'social', 'social_security'],
    'card':  ['card', 'credit', 'cc_num', 'card_number'],
}

SENSITIVE_VALUE_CHECKS = {
    'email': EMAIL_RE,
    'phone': PHONE_RE,
    'ssn':   SSN_RE,
    'card':  CARD_RE,
}


def detect_sensitive_columns(df: pd.DataFrame) -> list[str]:
    sensitive = set()
    for col in df.columns:
        col_lower = col.strip().lower().replace(' ', '_')
        for pii_type, hints in SENSITIVE_NAME_HINTS.items():
            if any(hint in col_lower for hint in hints):
                sensitive.add(col)
                break
        if col not in sensitive:
            sample = df[col].dropna().astype(str).head(20)
            for pii_type, pattern in SENSITIVE_VALUE_CHECKS.items():
                match_count = sample.apply(lambda v: bool(pattern.match(v.strip()))).sum()
                if match_count >= max(1, len(sample) * 0.5):
                    sensitive.add(col)
                    break
    return sorted(sensitive)


def generate_token() -> str:
    return "TKN_" + uuid.uuid4().hex[:4] + "_" + uuid.uuid4().hex[:4]


@app.route('/')
def home():
    return "Backend Running 🚀"


@app.route('/upload', methods=['POST'])
def upload():
    global token_vault

    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    filename = file.filename
    file_bytes = io.BytesIO(file.read())
    file_size = file_bytes.getbuffer().nbytes

    log_event("File uploaded", f"{filename} ({file_size / 1024:.1f} KB)", "upload")

    try:
        if filename.lower().endswith('.xlsx') or filename.lower().endswith('.xls'):
            try:
                df = pd.read_excel(file_bytes)
            except Exception:
                file_bytes.seek(0)
                df = pd.read_csv(file_bytes)
        else:
            df = pd.read_csv(file_bytes)
    except Exception as e:
        log_event("Parse error", str(e), "error")
        return jsonify({"error": str(e)}), 400

    # Detect sensitive columns
    sensitive_columns = detect_sensitive_columns(df)
    log_event("PII scan complete", f"{len(sensitive_columns)} sensitive columns detected", "scan")

    # Tokenize
    total_tokenized = 0
    for col in sensitive_columns:
        df[col] = df[col].astype(str)
        for i in range(len(df)):
            value = df.iloc[i][col].strip()
            if value and value.lower() != 'nan':
                token = generate_token()
                token_vault[token] = {
                    "original": value,
                    "column": col,
                    "row": i
                }
                df.at[i, col] = token
                total_tokenized += 1

    log_event("Tokenization executed",
              f"{len(df)} records • {total_tokenized} fields secured",
              "tokenize")

    return jsonify({
        "data": df.to_dict(orient='records'),
        "sensitive_columns": sensitive_columns,
        "total_records": len(df),
        "total_tokenized_fields": total_tokenized
    })


@app.route('/detokenize', methods=['POST'])
def detokenize():
    data = request.get_json()
    token = data.get("token", "").strip()

    if not token:
        return jsonify({"error": "Token ID is required"}), 400
    if not token.startswith("TKN_"):
        return jsonify({"error": "Invalid token format. Expected TKN_ prefix."}), 400

    entry = token_vault.get(token)
    if not entry:
        log_event("Detokenize failed", f"{token} → not found", "error")
        return jsonify({"error": f"Token '{token}' not found in vault."}), 404

    log_event("Detokenize request", f"{token} → revealed ({entry['column']})", "detokenize")

    return jsonify({
        "original": entry["original"],
        "column": entry["column"],
        "row": entry["row"]
    })


@app.route('/vault/stats', methods=['GET'])
def vault_stats():
    return jsonify({
        "total_tokens": len(token_vault),
        "columns": list(set(v["column"] for v in token_vault.values()))
    })


@app.route('/logs', methods=['GET'])
def get_logs():
    return jsonify({"logs": activity_log[:50]})


if __name__ == '__main__':
    print("🚀 Starting Flask server...")
    app.run(debug=True)