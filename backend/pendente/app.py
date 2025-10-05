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
    if os.path.isfile(planilha_jjj_name):
        # Carregar e processar a planilha
        df = pd.read_excel(planilha_jjj_name)
        columns_to_drop = [...]  # (mantenha sua lista de colunas a serem removidas)
        
        df_cleaned = df.drop(columns=columns_to_drop, errors='ignore')
        # (continue com seu processamento de dados)

        # Salvar o arquivo processado
        df_cleaned.to_excel(output_file, index=False)
        return "Planilha exportada com sucesso!"

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if allowed_credentials.get(username) == password:
        return jsonify({"success": True}), 200
    else:
        return jsonify({"success": False, "message": "Usuário ou senha inválidos."}), 401

@app.route('/process', methods=['POST'])
def process():
    data = request.json
    planilha_jjj_name = data['planilha_jjj_name']
    nomes_prazos_name = data['nomes_prazos_name']
    logradouro_name = data['logradouro_name']
    output_file = data['output_file']
    
    message = process_data(planilha_jjj_name, nomes_prazos_name, logradouro_name, output_file)
    return jsonify({"message": message}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))  # fallback para 5001 no local
    app.run(host="0.0.0.0", port=port)