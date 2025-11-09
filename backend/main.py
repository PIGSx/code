from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import io
import uuid
import time
import os
import tempfile
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from werkzeug.utils import secure_filename

app = Flask(__name__)

# ✅ Configuração de CORS
CORS(
    app,
    resources={r"/*": {"origins": [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://technoblade.shop"
    ]}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# ------------------------
# --- AUTENTICAÇÃO -------
# ------------------------
allowed_credentials = {
    "jaya": {"password": "697843", "role": "comum"},
    "hiury": {"password": "thebest", "role": "admin"},
    "renan": {"password": "renan2025", "role": "comum"}
}

active_tokens = {}
TOKEN_EXPIRATION = 3600  # 1 hora

@app.route("/")
def home():
    return jsonify({"status": "API unificada rodando 🚀"})

@app.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    username = data.get("username")
    password = data.get("password")
    user_info = allowed_credentials.get(username)

    if user_info and user_info["password"] == password:
        token = str(uuid.uuid4())
        active_tokens[token] = {
            "user": username,
            "role": user_info["role"],
            "expira_em": time.time() + TOKEN_EXPIRATION
        }
        return jsonify({"success": True, "token": token, "user": username, "role": user_info["role"]}), 200

    return jsonify({"success": False, "message": "Usuário ou senha inválidos"}), 401

@app.route("/logout", methods=["POST"])
def logout():
    data = request.json or {}
    token = data.get("token")
    if token in active_tokens:
        del active_tokens[token]
        return jsonify({"success": True, "message": "Logout realizado"}), 200
    return jsonify({"success": False, "message": "Token não encontrado"}), 404

@app.route("/current_user", methods=["POST"])
def current_user():
    data = request.json or {}
    token = data.get("token")
    info = active_tokens.get(token)
    if not info:
        return jsonify({"logged_in": False, "message": "Token inválido ou expirado"}), 401
    if time.time() > info["expira_em"]:
        del active_tokens[token]
        return jsonify({"logged_in": False, "message": "Token expirado"}), 401
    return jsonify({"logged_in": True, "user": info["user"], "role": info["role"]}), 200

def check_token():
    token_header = request.headers.get("Authorization")
    if not token_header or not token_header.startswith("Bearer "):
        return None, jsonify({"error": "Token ausente"}), 401
    token = token_header.split(" ")[1]
    info = active_tokens.get(token)
    if not info:
        return None, jsonify({"error": "Token inválido ou expirado"}), 403
    if time.time() > info["expira_em"]:
        del active_tokens[token]
        return None, jsonify({"error": "Token expirado"}), 403
    return info, None, None

# ------------------------
# --- MATERIAIS ----------
# ------------------------
EXCEL_PATH = os.path.join(os.path.dirname(__file__), "CODIGOS.xlsx")

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

@app.route("/upload_materiais", methods=["POST"])
def upload_excel():
    info, err_resp, status = check_token()
    if err_resp:
        return err_resp, status

    if info["role"] != "admin":
        return jsonify({"error": "Acesso negado"}), 403

    if "file" not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400
    file = request.files["file"]
    if not file.filename.endswith((".xlsx", ".xls")):
        return jsonify({"error": "Arquivo inválido"}), 400

    try:
        filename = secure_filename(file.filename)
        file.save(EXCEL_PATH)
        return jsonify({"message": "Planilha atualizada com sucesso ✅"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------------
# --- PENDENTE PROCESSAR --
# ------------------------
@app.route("/pendente/processar", methods=["POST"])
def processar_pendente():
    """
    Recebe até 3 planilhas e retorna o Excel processado.
    """
    info, err_resp, status = check_token()
    if err_resp:
        return err_resp, status

    try:
        # 🧩 Recebe arquivos do front
        planilha_principal = request.files.get("relatorio_fechados")
        prazos = request.files.get("planilha_prazos")
        logradouros = request.files.get("pagina_guia")
        nome_relatorio = request.form.get("nome_do_relatorio", "pendente_processado.xlsx")

        if not planilha_principal:
            return jsonify({"error": "⚠️ Envie a planilha principal (relatorio_fechados)."}), 400
        if not prazos:
            return jsonify({"error": "⚠️ Envie também a planilha de prazos."}), 400

        # 🧠 Tenta ler as planilhas
        try:
            df_main = pd.read_excel(planilha_principal)
            df_prazos = pd.read_excel(prazos)
            df_log = pd.read_excel(logradouros) if logradouros else None
        except Exception as e:
            return jsonify({"error": f"Erro ao ler uma das planilhas: {str(e)}"}), 400

        # 🧹 Limpeza de colunas
        drop_cols = [
            "Nome da Origem", "Unidade Executante", "Código TSS", "Prioridade", "Equipe",
            "PDE", "Município", "Cod. Município", "Setor", "Rota", "Quadra", "Local",
            "Vila", "SubLocal", "ATO", "Área de Serviço", "Grupo de Faturamento",
            "Data Inserção", "Data Agendada", "Prazo de Execução", "Notas de Acatamento",
            "Arsesp"
        ]
        df_main.drop(columns=drop_cols, errors="ignore", inplace=True)

        # 🔎 Filtros
        df_main = df_main[~df_main['Família'].isin(['FISCALIZAÇÃO', 'VISTORIA'])]
        df_main = df_main[~df_main['Contrato'].isin([
            '4600042975 - CONSORCIO MANUTENÇÃO SUZANO ZC',
            '4600054507 - ENOPS ENGENHARIA S/A.',
            '4600054538 - CONSÓRCIO LEITURA ITAQUERA',
            '4600057156 - CONSÓRCIO DARWIN TB LESTE',
            '4600060030 - CONSÓRCIO AMPLIA REDE LESTE',
            '4600060107 - CONSÓRCIO AMPLIA REDE ALTO TIETÊ',
            '4600060108 - CONSÓRCIO AMPLIA REDE ALTO TIETÊ',
            '9999999999 - SABESP'
        ])]

        # 🧮 Ajustes de dados
        df_main['ATC'] = df_main['ATC'].astype(str).str.extract(r'(\d+)')[0]
        df_main = df_main[df_main['Descrição TSS'] != 'TROCAR HIDRÔMETRO PREVENTIVA AGENDADA']

        if 'Data de Competência' in df_main.columns:
            df_main['Data de Competência'] = pd.to_datetime(df_main['Data de Competência'], errors='coerce')

        # 🔗 Merge com prazos
        df_merge = pd.merge(df_main, df_prazos[['Descrição TSS', 'PRAZO (HORAS)']], on='Descrição TSS', how='left')

        # 🔗 Merge com logradouros (opcional)
        if df_log is not None:
            try:
                df_merge = pd.merge(df_merge, df_log[['Logradouro', 'Página Guia']], left_index=True, right_index=True, how='left')
                df_merge.drop(columns=['Logradouro'], errors='ignore', inplace=True)
            except Exception:
                pass  # ignora se a planilha tiver colunas diferentes

        # 📍 Endereço completo
        if 'Número' in df_merge.columns and 'Complemento' in df_merge.columns:
            df_merge['Endereço'] = (
                df_merge['Endereço'].fillna('') + ' ' +
                df_merge['Número'].fillna('').astype(str) + ' ' +
                df_merge['Complemento'].fillna('').astype(str)
            ).str.strip()
            df_merge.drop(columns=['Número', 'Complemento'], errors='ignore', inplace=True)

        # 🕒 Calcular data final
        if 'PRAZO (HORAS)' in df_merge.columns:
            df_merge['Data Final'] = df_merge['Data de Competência'] + pd.to_timedelta(df_merge['PRAZO (HORAS)'], unit='h')

        # 🧾 Ordenar colunas
        cols = ['Status', 'Número OS', 'ATC', 'Endereço', 'Bairro', 'Página Guia',
                'Data de Competência', 'Data Final', 'Descrição TSS',
                'PRAZO (HORAS)', 'Contrato', 'Causa', 'Resultado']
        cols = [c for c in cols if c in df_merge.columns]
        df_merge = df_merge[cols]

        # 💾 Salvar e enviar
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx")
        df_merge.to_excel(temp_file.name, index=False)
        temp_file.close()

        return send_file(temp_file.name, as_attachment=True, download_name=nome_relatorio)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------------
# --- RASTREADOR ---------
# ------------------------
@app.route("/rastreador", methods=["POST"])
def rastreador_login():
    info, err_resp, status = check_token()
    if err_resp:
        return err_resp, status

    if info["role"] != "admin":
        return jsonify({"status": "error", "mensagem": "Acesso negado: somente administradores"}), 403

    try:
        navegador = webdriver.Chrome()
        navegador.maximize_window()
        navegador.get("https://web.hapolo.com.br/")

        WebDriverWait(navegador, 20).until(EC.presence_of_element_located((By.XPATH, '//*[@id="id_user"]')))
        navegador.find_element(By.XPATH, '//*[@id="id_user"]').send_keys("psbltda")
        navegador.find_element(By.XPATH, '//input[@name="password"]').send_keys("010203" + Keys.RETURN)

        WebDriverWait(navegador, 20).until(lambda d: "hapolo" in d.current_url.lower())

        return jsonify({
            "status": "success",
            "mensagem": "✅ Login realizado no Hapolo! A aba foi mantida aberta."
        })

    except Exception as e:
        return jsonify({"status": "error", "mensagem": f"Erro no rastreador: {str(e)}"}), 500

# ------------------------
# --- RUN ----------------
# ------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    print(f"🚀 Servidor rodando em http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)