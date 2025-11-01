from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import io
import uuid
import time
import os
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # ✅ Permite acesso de qualquer origem (frontend local ou IP)

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

@app.route("/processar_materiais", methods=["POST"])
def processar_materiais():
    try:
        kits_file = request.files.get('kits')
        baixas_file = request.files.get('baixas')
        if not kits_file or not baixas_file:
            return jsonify({"error": "Envie os dois arquivos!"}), 400

        kits = pd.read_excel(kits_file, engine='openpyxl')
        baixas = pd.read_excel(baixas_file, engine='openpyxl')

        kits.columns = kits.columns.str.strip()
        baixas.columns = baixas.columns.str.strip()

        kits = kits[['Material', 'TSE', 'Quantidade']]
        baixas = baixas[['Número OS', 'Material', 'Quantidade - Unidade de Medida', 'TSE']]

        baixas['Codigo'] = baixas['Material'].astype(str)
        baixas['Quantidade'] = (baixas['Quantidade - Unidade de Medida'].astype(str)
                                .str.split().str[0]
                                .str.extract(r'(\d+\.?\d*)')[0]
                                .astype(float, errors='ignore'))

        kits_dict = kits.groupby("TSE").apply(lambda x: dict(zip(x["Material"], x["Quantidade"]))).to_dict()

        def conferir_os(df_os):
            tse = df_os["TSE"].iloc[0]
            materiais_esperados = kits_dict.get(tse, {})
            if not materiais_esperados:
                return {"TSE": tse, "Status": "não localizado"}
            materiais_lancados = df_os.groupby("Codigo")["Quantidade"].sum().to_dict()
            faltando = {k: v - materiais_lancados.get(k, 0) for k, v in materiais_esperados.items() if materiais_lancados.get(k, 0) < v}
            extras = {k: v for k, v in materiais_lancados.items() if k not in materiais_esperados}
            status = "OK" if not faltando and not extras else "Pendente"
            return {
                "TSE": tse,
                "Esperado": str(materiais_esperados),
                "Lançado": str(materiais_lancados),
                "Faltando": str(faltando) if faltando else "–",
                "Extras": str(extras) if extras else "–",
                "Status": status
            }

        relatorio = baixas.groupby("Número OS").apply(conferir_os).reset_index().to_dict(orient='records')
        return jsonify(relatorio)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# ------------------------
# --- RASTREADOR ---------
# ------------------------
@app.route('/rastreador/abrir-site', methods=['POST'])
def rastreador_abrir_site():
    info, err_resp, status = check_token()
    if err_resp:
        return err_resp, status

    if info["role"] != "admin":
        return jsonify({"status": "error", "mensagem": "Acesso negado: somente administradores"}), 403

    try:
        navegador = webdriver.Chrome()  # Inicia o navegador
        navegador.maximize_window()  # Maximiza a janela do navegador

        navegador.get("https://web.hapolo.com.br/")
        
        WebDriverWait(navegador, 20).until(EC.presence_of_element_located((By.XPATH, '//*[@id="id_user"]')))
        navegador.find_element(By.XPATH, '//*[@id="id_user"]').send_keys("psbltda")
        navegador.find_element(By.XPATH, '//input[@name="password"]').send_keys("010203" + Keys.RETURN)

        WebDriverWait(navegador, 20).until(EC.title_contains('Título Esperado Depois do Login'))

        cookies = navegador.get_cookies()
        titulo = navegador.title

        return jsonify({
            "status": "success",
            "mensagem": f"✅ Login feito no servidor! Página acessada: {titulo}",
            "cookies": cookies
        })

    except Exception as e:
        return jsonify({"status": "error", "mensagem": f"❌ Erro na execução do Selenium: {str(e)}"}), 500

# ------------------------
# --- RUN -----------------
# ------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 Servidor rodando em: http://localhost:{port}")
    try:
        ip_local = os.popen("hostname -I").read().strip().split()[0]
        print(f"🌐 Acesse via rede: http://{ip_local}:{port}")
    except:
        pass
    app.run(host="0.0.0.0", port=port, debug=True)
