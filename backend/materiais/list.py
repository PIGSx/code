from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import os
import requests

app = Flask(__name__)
CORS(app)

EXCEL_PATH = os.path.join(os.path.dirname(__file__), "CODIGOS.xlsx")
AUTH_API_URL = "http://127.0.0.1:5004/validate"  # caminho do auth.py

@app.route("/")
def home():
    return jsonify({"status": "API Materiais rodando 🚀"})

@app.route("/materiais", methods=["GET"])
def listar_materiais():
    try:
        if not os.path.exists(EXCEL_PATH):
            return jsonify({"error": "Arquivo de materiais não encontrado"}), 404

        df = pd.read_excel(EXCEL_PATH)
        df.columns = [col.strip() for col in df.columns]
        materiais = df.to_dict(orient="records")
        return jsonify(materiais), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/upload", methods=["POST"])
def upload_excel():
    token_header = request.headers.get("Authorization")

    if not token_header or not token_header.startswith("Bearer "):
        return jsonify({"error": "Token ausente"}), 401

    token = token_header.split(" ")[1]

    # Valida token com a API de autenticação
    try:
        resp = requests.post(AUTH_API_URL, json={"token": token})
        valid_data = resp.json()
        if not valid_data.get("valid"):
            return jsonify({"error": "Acesso negado"}), 403
    except Exception as e:
        return jsonify({"error": f"Falha ao validar token: {e}"}), 500

    # Processa upload
    if "file" not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400

    file = request.files["file"]
    if not file.filename.endswith((".xlsx", ".xls")):
        return jsonify({"error": "Arquivo inválido"}), 400

    try:
        file.save(EXCEL_PATH)
        return jsonify({"message": "Planilha atualizada com sucesso ✅"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5003))
    app.run(host="0.0.0.0", port=port, debug=True)
