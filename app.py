from flask import Flask, request, jsonify
import os, logging
from datetime import datetime

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

@app.route("/")
def index():
    return "<h1>🚀 Manus AI API Backend</h1><p>Running on Azure App Service.</p>"

@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json() or {}
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "Missing text"}), 400

    result = {
        "timestamp": datetime.utcnow().isoformat(),
        "input_length": len(text),
        "summary": f"Received {len(text.split())} words."
    }
    return jsonify(result)

@app.route("/health")
def health():
    return jsonify({"status": "ok", "time": datetime.utcnow().isoformat()})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
