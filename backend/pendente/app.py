from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import io
import requests
import os

app = Flask(__name__)
CORS(app)

AUTH_URL = "http://127.0.0.1:5004"  # API de autenticação

# --- Função principal de processamento ---
def process_data(planilha_file, planilha_prazos_file=None, logradouro_file=None):
    try:
        # Ler planilha principal
        df = pd.read_excel(planilha_file)

        # 1. Remover colunas desnecessárias
        columns_to_drop = [
            "Nome da Origem", "Unidade Executante", "Código TSS", "Prioridade", "Equipe",
            "PDE", "Município", "Cod. Município", "Setor", "Rota", "Quadra", "Local",
            "Vila", "SubLocal", "ATO", "Área de Serviço", "Grupo de Faturamento",
            "Data Inserção", "Data Agendada", "Prazo de Execução", "Notas de Acatamento",
            "Arsesp"
        ]
        df = df.drop(columns=columns_to_drop, errors='ignore')

        # 2. Filtrar Família
        df = df[~df['Família'].isin(['FISCALIZAÇÃO', 'VISTORIA'])]

        # 3. Filtrar Contratos
        df = df[~df['Contrato'].isin([
            '4600042975 - CONSORCIO MANUTENÇÃO SUZANO ZC',
            '4600054507 - ENOPS ENGENHARIA S/A.',
            '4600054538 - CONSÓRCIO LEITURA ITAQUERA',
            '4600057156 - CONSORCIO DARWIN TB LESTE',
            '4600060030 - CONSÓRCIO AMPLIA REDE LESTE',
            '4600060107 - CONSÓRCIO AMPLIA REDE ALTO TIETÊ',
            '4600060108 - CONSÓRCIO AMPLIA REDE ALTO TIETÊ',
            '9999999999 - SABESP'
        ])]

        # 4. Ajustar ATC
        df['ATC'] = df['ATC'].astype(str).str.extract(r'(\d+)')[0]

        # 5. Filtrar Descrição TSS
        df = df[df['Descrição TSS'] != 'TROCAR HIDRÔMETRO PREVENTIVA AGENDADA']

        # 6. Data de Competência
        if 'Data de Competência' in df.columns:
            df['Data de Competência'] = pd.to_datetime(df['Data de Competência'], errors='coerce')

        # 7. Mesclar planilha de prazos
        if planilha_prazos_file:
            df_nomes_prazos = pd.read_excel(planilha_prazos_file)
            df = pd.merge(df, df_nomes_prazos[['Descrição TSS','PRAZO (HORAS)']],
                          on='Descrição TSS', how='left')

        # 8. Mesclar logradouro
        if logradouro_file:
            df_logradouro = pd.read_excel(logradouro_file)
            df = pd.merge(df, df_logradouro[['Logradouro','Página Guia']],
                          left_index=True, right_index=True, how='left')
            df = df.drop(columns=['Logradouro'], errors='ignore')

        # 9. Endereço final
        if 'Número' in df.columns and 'Complemento' in df.columns:
            df['Endereço'] = (
                df['Endereço'].fillna('').str.strip() + ' ' +
                df['Número'].fillna('').astype(str) + ' ' +
                df['Complemento'].fillna('').astype(str)
            ).str.strip()
            df = df.drop(columns=['Número','Complemento'], errors='ignore')

        # 10. Data final
        if 'PRAZO (HORAS)' in df.columns and 'Data de Competência' in df.columns:
            df['Data Final'] = df['Data de Competência'] + pd.to_timedelta(df['PRAZO (HORAS)'], unit='h')

        # 11. Reorganizar colunas
        columns_order = ['Status', 'Número OS', 'ATC', 'Endereço', 'Bairro', 'Página Guia',
                         'Data de Competência', 'Data Final', 'Descrição TSS',
                         'PRAZO (HORAS)', 'Contrato', 'Causa', 'Resultado']
        available_columns = [col for col in columns_order if col in df.columns]
        df = df[available_columns]

        # 12. Salvar em BytesIO
        output_stream = io.BytesIO()
        df.to_excel(output_stream, index=False, engine="openpyxl")
        output_stream.seek(0)
        return output_stream

    except Exception as e:
        return str(e)

# --- Rotas Flask ---
@app.route("/")
def home():
    return "API code-pendente rodando com sucesso 🚀"

@app.route("/process", methods=["POST"])
def process():
    token_header = request.headers.get("Authorization")
    if not token_header or not token_header.startswith("Bearer "):
        return jsonify({"error": "Token ausente"}), 401
    token = token_header.split(" ")[1]

    # Validação do token com AUTH API
    try:
        resp = requests.post(f"{AUTH_URL}/validate", json={"token": token})
        if resp.status_code != 200 or not resp.json().get("valid"):
            return jsonify({"error": "Token inválido ou expirado"}), 403
    except Exception as e:
        return jsonify({"error": f"Falha ao validar token: {e}"}), 500

    # Receber arquivos
    planilha_file = request.files.get("relatorio_fechados")
    planilha_prazos_file = request.files.get("planilha_prazos")
    logradouro_file = request.files.get("pagina_guia")
    nome_do_relatorio = request.form.get("nome_do_relatorio") or "saida.xlsx"

    if not planilha_file:
        return jsonify({"error": "Nenhum arquivo principal enviado"}), 400

    processed_stream = process_data(planilha_file, planilha_prazos_file, logradouro_file)
    if isinstance(processed_stream, str):
        return jsonify({"error": processed_stream}), 500

    return send_file(
        processed_stream,
        as_attachment=True,
        download_name=nome_do_relatorio,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5002))
    app.run(host="0.0.0.0", port=port, debug=True)
