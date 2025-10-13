from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Credenciais de login permitidas
allowed_credentials = {
    "jaya": "697843",
    "hiury": "thebest",
    "renan": "renan2025"
}

# Função para processar os dados
def process_data(planilha_jjj_name, nomes_prazos_name, logradouro_name, output_file):
    try:
        if os.path.isfile(planilha_jjj_name):
            df = pd.read_excel(planilha_jjj_name)
            # TODO: Substitua [...] pela sua lista de colunas
            columns_to_drop = []  # exemplo: ['Coluna1', 'Coluna2']
            df_cleaned = df.drop(columns=columns_to_drop, errors='ignore')
            # (adicione o restante do seu processamento aqui)

            df_cleaned.to_excel(output_file, index=False)
            return "Planilha exportada com sucesso!"
        else:
            return "Arquivo não encontrado."
    except Exception as e:
        return f"Erro ao processar: {e}"

@app.route('/')
def home():
    return "API code-pendente rodando com sucesso 🚀"

@app.route('/login', methods=['POST'])
def login():
    data = request.json or {}
    username = data.get('username')
    password = data.get('password')
    
    if allowed_credentials.get(username) == password:
        return jsonify({"success": True}), 200
    else:
        return jsonify({"success": False, "message": "Usuário ou senha inválidos."}), 401

@app.route('/process', methods=['POST'])
def process():
    data = request.json or {}
    planilha_jjj_name = data.get('planilha_jjj_name')
    nomes_prazos_name = data.get('nomes_prazos_name')
    logradouro_name = data.get('logradouro_name')
    output_file = data.get('output_file')

    message = process_data(planilha_jjj_name, nomes_prazos_name, logradouro_name, output_file)
    return jsonify({"message": message}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Render define a porta em PORT
    app.run(host="0.0.0.0", port=port)
