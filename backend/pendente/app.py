from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS
import os
import requests

app = Flask(__name__)
CORS(app)

# URL da API de autenticação
AUTH_URL = os.environ.get("AUTH_URL", "http://127.0.0.1:5004")  # ou Render URL

# Função para processar os dados
def process_data(planilha_jjj_name, nomes_prazos_name, logradouro_name, output_file):
    try:
        if os.path.isfile(planilha_jjj_name):
            df = pd.read_excel(planilha_jjj_name)
            columns_to_drop = []  # exemplo: ['Coluna1', 'Coluna2']
            df_cleaned = df.drop(columns=columns_to_drop, errors='ignore')
            # Adicione aqui o restante do processamento
            df_cleaned.to_excel(output_file, index=False)
            return "Planilha exportada com sucesso!"
        else:
            return "Arquivo não encontrado."
    except Exception as e:
        return f"Erro ao processar: {e}"

@app.route('/')
def home():
    return "API code-pendente rodando com sucesso 🚀"

# --- LOGIN ---
@app.route('/login', methods=['POST'])
def login():
    data = request.json or {}
    username = data.get('username')
    password = data.get('password')

    try:
        # Chama auth.py /login
        res = requests.post(f"{AUTH_URL}/login", json={"username": username, "password": password})
        if res.status_code == 200:
            token = res.json().get("token")
            user = res.json().get("user")
            return jsonify({"success": True, "token": token, "user": user}), 200
        else:
            return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"success": False, "message": f"Erro ao conectar com auth: {e}"}), 500

# --- PROCESSAR ARQUIVO ---
@app.route('/process', methods=['POST'])
def process():
    token_header = request.headers.get("Authorization")
    if not token_header or not token_header.startswith("Bearer "):
        return jsonify({"error": "Token ausente"}), 401
    token = token_header.split(" ")[1]

    # Valida token com auth.py
    try:
        resp = requests.post(f"{AUTH_URL}/validate", json={"token": token})
        if resp.status_code != 200 or not resp.json().get("valid"):
            return jsonify({"error": "Token inválido ou expirado"}), 403
    except Exception as e:
        return jsonify({"error": f"Falha ao validar token: {e}"}), 500

    data = request.json or {}
    planilha_jjj_name = data.get('planilha_jjj_name')
    nomes_prazos_name = data.get('nomes_prazos_name')
    logradouro_name = data.get('logradouro_name')
    output_file = data.get('output_file')

    message = process_data(planilha_jjj_name, nomes_prazos_name, logradouro_name, output_file)
    return jsonify({"message": message}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5002))
    app.run(host="0.0.0.0", port=port)
