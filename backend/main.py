# main.py — Technoblade API (Versão LOCAL para Desenvolvimento)
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS  # ✅ Adicionado
import pandas as pd
import uuid
import time
import os
import tempfile
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException

app = Flask(__name__)

# ✅ CORS PARA DESENVOLVIMENTO LOCAL
CORS(app, resources={r"/*": {"origins": "*"}})

# ---------------- AUTH ----------------
allowed_credentials = {
    "jaya": {"password": "697843", "role": "comum"},
    "hiury": {"password": "thebest", "role": "admin"},
    "renan": {"password": "renan2025", "role": "comum"}
}

active_tokens = {}
TOKEN_EXPIRATION = 3600  # segundos

def make_token(username, role):
    t = str(uuid.uuid4())
    active_tokens[t] = {"user": username, "role": role, "expira_em": time.time() + TOKEN_EXPIRATION}
    return t

def check_token():
    auth = request.headers.get("Authorization", "")
    if not auth or not auth.startswith("Bearer "):
        return None, (jsonify({"error": "Token ausente"}), 401)
    token = auth.split(" ", 1)[1]
    info = active_tokens.get(token)
    if not info:
        return None, (jsonify({"error": "Token inválido ou expirado"}), 403)
    if time.time() > info["expira_em"]:
        del active_tokens[token]
        return None, (jsonify({"error": "Token expirado"}), 403)
    return info, (None, None)

# ---------------- ROTAS ----------------
@app.route("/")
def home():
    return jsonify({"status": "API unificada rodando 🚀"})

@app.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    username = data.get("username")
    password = data.get("password")
    user = allowed_credentials.get(username)
    if user and user["password"] == password:
        token = make_token(username, user["role"])
        return jsonify({
            "success": True,
            "token": token,
            "user": username,
            "role": user["role"]
        }), 200
    return jsonify({"success": False, "message": "Usuário ou senha inválidos"}), 401

@app.route("/logout", methods=["POST"])
def logout():
    data = request.json or {}
    token = data.get("token")
    if token and token in active_tokens:
        del active_tokens[token]
        return jsonify({"success": True, "message": "Logout realizado"}), 200
    return jsonify({"success": False, "message": "Token não encontrado"}), 404

@app.route("/current_user", methods=["POST"])
def current_user():
    data = request.json or {}
    token = data.get("token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth.split(" ", 1)[1]
    info = active_tokens.get(token)
    if not info:
        return jsonify({"logged_in": False, "message": "Token inválido ou expirado"}), 401
    if time.time() > info["expira_em"]:
        del active_tokens[token]
        return jsonify({"logged_in": False, "message": "Token expirado"}), 401
    return jsonify({"logged_in": True, "user": info["user"], "role": info["role"]}), 200

# ---------------- MATERIAIS ----------------
EXCEL_PATH = os.path.join(os.path.dirname(__file__), "CODIGOS.xlsx")

@app.route("/materiais", methods=["GET"])
def listar_materiais():
    try:
        if not os.path.exists(EXCEL_PATH):
            return jsonify({"error": "Arquivo de materiais não encontrado"}), 404
        df = pd.read_excel(EXCEL_PATH)
        df.columns = [c.strip() for c in df.columns]
        return jsonify(df.to_dict(orient="records")), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/upload_materiais", methods=["POST"])
def upload_materiais():
    info, err = check_token()
    if err[0]:
        return err
    if info["role"] != "admin":
        return jsonify({"error": "Acesso negado"}), 403
    if "file" not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400
    f = request.files["file"]
    if not f.filename.lower().endswith((".xlsx", ".xls")):
        return jsonify({"error": "Arquivo inválido"}), 400
    try:
        f.save(EXCEL_PATH)
        return jsonify({"message": "Planilha atualizada com sucesso ✅"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------- PENDENTE ----------------
@app.route("/pendente/processar", methods=["POST"])
def processar_pendente():
    info, err = check_token()
    if err[0]:
        return err
    try:
        relatorio = request.files.get("relatorio_fechados")
        prazos = request.files.get("planilha_prazos")
        pagina_guia = request.files.get("pagina_guia")

        if not relatorio:
            return jsonify({"error": "Envie a planilha principal"}), 400

        df_main = pd.read_excel(relatorio)
        df_main.columns = [c.strip() for c in df_main.columns]
        df_prazos = pd.read_excel(prazos) if prazos else None
        df_log = pd.read_excel(pagina_guia) if pagina_guia else None

        drop_cols = ["Nome da Origem", "Unidade Executante", "Código TSS", "Prioridade", "Equipe",
                     "PDE", "Município", "Cod. Município", "Setor", "Rota", "Quadra", "Local",
                     "Vila", "SubLocal", "ATO", "Área de Serviço", "Grupo de Faturamento",
                     "Data Inserção", "Data Agendada", "Prazo de Execução", "Notas de Acatamento",
                     "Arsesp"]
        df_main.drop(columns=[c for c in drop_cols if c in df_main.columns], inplace=True, errors='ignore')

        if 'Família' in df_main.columns:
            df_main = df_main[~df_main['Família'].isin(['FISCALIZAÇÃO', 'VISTORIA'])]
        if 'Contrato' in df_main.columns:
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

        if 'ATC' in df_main.columns:
            df_main['ATC'] = df_main['ATC'].astype(str).str.extract(r'(\d+)')[0]
        if 'Descrição TSS' in df_main.columns:
            df_main = df_main[df_main['Descrição TSS'] != 'TROCAR HIDRÔMETRO PREVENTIVA AGENDADA']
        if 'Data de Competência' in df_main.columns:
            df_main['Data de Competência'] = pd.to_datetime(df_main['Data de Competência'], errors='coerce')

        df_merge = df_main
        if df_prazos is not None and 'Descrição TSS' in df_prazos.columns:
            df_merge = pd.merge(df_merge, df_prazos[['Descrição TSS', 'PRAZO (HORAS)']], on='Descrição TSS', how='left')
        if df_log is not None and 'Logradouro' in df_log.columns and 'Página Guia' in df_log.columns:
            df_merge = pd.merge(df_merge, df_log[['Logradouro', 'Página Guia']], left_index=True, right_index=True, how='left')
            df_merge.drop(columns=['Logradouro'], errors='ignore', inplace=True)

        if 'Número' in df_merge.columns and 'Complemento' in df_merge.columns and 'Endereço' in df_merge.columns:
            df_merge['Endereço'] = (
                df_merge['Endereço'].fillna('').astype(str).str.strip() + ' ' +
                df_merge['Número'].fillna('').astype(str) + ' ' +
                df_merge['Complemento'].fillna('').astype(str)
            ).str.trim()
            df_merge.drop(columns=['Número', 'Complemento'], errors='ignore', inplace=True)

        if 'PRAZO (HORAS)' in df_merge.columns and 'Data de Competência' in df_merge.columns:
            df_merge['Data Final'] = df_merge['Data de Competência'] + pd.to_timedelta(df_merge['PRAZO (HORAS)'], unit='h')

        cols = ['Status', 'Número OS', 'ATC', 'Endereço', 'Bairro', 'Página Guia',
                'Data de Competência', 'Data Final', 'Descrição TSS',
                'PRAZO (HORAS)', 'Contrato', 'Causa', 'Resultado']
        cols = [c for c in cols if c in df_merge.columns]
        df_merge = df_merge[cols]

        tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx')
        df_merge.to_excel(tmp.name, index=False)
        tmp.close()

        filename = request.form.get("nome_do_relatorio") or "saida.xlsx"
        if not filename.lower().endswith(".xlsx"):
            filename += ".xlsx"

        return send_file(tmp.name, as_attachment=True, download_name=filename, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------- RASTREADOR ----------------
@app.route("/rastreador/abrir-site", methods=["POST"])
def rastreador_abrir_site():
    info, err = check_token()
    if err[0]:
        return err
    if info["role"] != "admin":
        return jsonify({"status": "error", "mensagem": "Acesso negado: somente administradores"}), 403

    try:
        options = webdriver.ChromeOptions()
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")

        navegador = webdriver.Chrome(options=options)
        navegador.get("https://web.hapolo.com.br/")

        WebDriverWait(navegador, 20).until(EC.presence_of_element_located((By.XPATH, '//*[@id="id_user"]')))
        navegador.find_element(By.XPATH, '//*[@id="id_user"]').send_keys("psbltda")
        navegador.find_element(By.XPATH, '//input[@name="password"]').send_keys("010203" + Keys.RETURN)

        WebDriverWait(navegador, 20).until(lambda d: "hapolo" in d.current_url.lower())

        cookies = navegador.get_cookies()
        titulo = navegador.title

        return jsonify({"status": "success", "mensagem": "✅ Login realizado no Hapolo!", "title": titulo, "cookies": cookies})
    except (TimeoutException, WebDriverException) as e:
        return jsonify({"status": "error", "mensagem": f"Erro no rastreador: {str(e)}"}), 500
    finally:
        try:
            navegador.quit()
        except:
            pass

# ---------------- RUN ----------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5055))
    print(f"🚀 Servidor rodando em http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
